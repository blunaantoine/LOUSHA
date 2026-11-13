/**
 * Service PayDunya — paiement en ligne (Mobile Money, cartes bancaires).
 *
 * API « Paiement avec redirection » (checkout invoice) :
 *   POST {base}/checkout-invoice/create        → crée la facture, renvoie l'URL de paiement
 *   GET  {base}/checkout-invoice/confirm/{tok} → état de la facture
 * base = https://app.paydunya.com/sandbox-api/v1 (test) ou /api/v1 (production)
 *
 * Clés à définir dans le fichier .env du serveur :
 *   PAYDUNYA_MASTER_KEY, PAYDUNYA_PRIVATE_KEY, PAYDUNYA_TOKEN
 *   PAYDUNYA_MODE = "test" (par défaut) ou "live" pour encaisser réellement
 */
import { db } from "@/lib/db";

const TIMEOUT_MS = 15000;

function config() {
  const masterKey = process.env.PAYDUNYA_MASTER_KEY;
  const privateKey = process.env.PAYDUNYA_PRIVATE_KEY;
  const token = process.env.PAYDUNYA_TOKEN;
  const live = (process.env.PAYDUNYA_MODE ?? "test").toLowerCase() === "live";
  return {
    configured: !!masterKey && !!privateKey && !!token,
    live,
    baseUrl: live
      ? "https://app.paydunya.com/api/v1"
      : "https://app.paydunya.com/sandbox-api/v1",
    headers: {
      "PAYDUNYA-MASTER-KEY": masterKey ?? "",
      "PAYDUNYA-PRIVATE-KEY": privateKey ?? "",
      "PAYDUNYA-TOKEN": token ?? "",
      "Content-Type": "application/json",
    },
  };
}

export function isPaydunyaConfigured(): boolean {
  return config().configured;
}

export function isPaydunyaLive(): boolean {
  return config().live;
}

/** Montant XOF entier à partir des centimes stockés en base. */
export function centsToXof(cents: number): number {
  return Math.round(cents / 100);
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  unitPriceXof: number;
}

export async function createCheckoutInvoice(input: {
  orderId: string;
  totalXof: number;
  description: string;
  items: InvoiceItem[];
  returnUrl: string;
  cancelUrl: string;
  callbackUrl: string;
  storeUrl: string;
}): Promise<{ token: string; url: string }> {
  const c = config();
  if (!c.configured) throw new Error("PayDunya n'est pas configuré");

  const items: Record<string, unknown> = {};
  input.items.forEach((it, i) => {
    items[`item_${i + 1}`] = {
      name: it.name.slice(0, 120),
      quantity: it.quantity,
      unit_price: it.unitPriceXof,
      total_price: it.unitPriceXof * it.quantity,
    };
  });

  const body = {
    invoice: {
      total_amount: input.totalXof,
      description: input.description.slice(0, 250),
      items,
    },
    store: {
      name: "Lousha Accessoires",
      tagline: "Raphia fait main au Togo",
      website_url: input.storeUrl,
    },
    actions: {
      return_url: input.returnUrl,
      cancel_url: input.cancelUrl,
      callback_url: input.callbackUrl,
    },
    custom_data: { order_id: input.orderId },
  };

  const res = await fetch(`${c.baseUrl}/checkout-invoice/create`, {
    method: "POST",
    headers: c.headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = (await res.json().catch(() => ({}))) as {
    response_code?: string;
    response_text?: string;
    token?: string;
  };
  if (data.response_code !== "00" || !data.token || !data.response_text) {
    throw new Error(
      `Création de la facture PayDunya refusée (${data.response_code ?? res.status}): ${data.response_text ?? ""}`
    );
  }
  return { token: data.token, url: data.response_text };
}

export type PaydunyaStatus = "completed" | "pending" | "cancelled" | "failed" | "unknown";

export async function confirmInvoice(token: string): Promise<{
  status: PaydunyaStatus;
  totalXof: number | null;
  orderId: string | null;
}> {
  const c = config();
  if (!c.configured) throw new Error("PayDunya n'est pas configuré");
  const res = await fetch(
    `${c.baseUrl}/checkout-invoice/confirm/${encodeURIComponent(token)}`,
    { headers: c.headers, signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" }
  );
  const data = (await res.json().catch(() => ({}))) as {
    response_code?: string;
    status?: string;
    invoice?: { total_amount?: number | string };
    custom_data?: { order_id?: string };
  };
  if (data.response_code !== "00") {
    throw new Error(`Vérification PayDunya impossible (${data.response_code ?? res.status})`);
  }
  const raw = (data.status ?? "").toLowerCase();
  const status: PaydunyaStatus =
    raw === "completed"
      ? "completed"
      : raw === "pending"
        ? "pending"
        : raw === "cancelled" || raw === "canceled"
          ? "cancelled"
          : raw === "failed" || raw === "fail"
            ? "failed"
            : "unknown";
  const total = Number(data.invoice?.total_amount);
  return {
    status,
    totalXof: Number.isFinite(total) ? total : null,
    orderId: data.custom_data?.order_id ?? null,
  };
}

/**
 * Met à jour une commande PayDunya d'après l'état réel chez PayDunya.
 *
 * C'est la seule fonction qui marque une commande comme payée. Elle ne se fie
 * jamais à ce que renvoie le navigateur ou la notification : elle interroge
 * PayDunya avec les clés privées, et vérifie le montant et la commande.
 */
export async function syncPaydunyaOrder(orderId: string): Promise<string | null> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });
  if (!order) return null;
  const payment = order.payment;
  if (!payment || payment.provider !== "PAYDUNYA" || order.status !== "PENDING") {
    return order.status;
  }

  const result = await confirmInvoice(payment.transactionId);

  if (result.status === "completed") {
    const expected = centsToXof(order.totalCents);
    const amountOk = result.totalXof !== null && Math.round(result.totalXof) === expected;
    const orderOk = !result.orderId || result.orderId === order.id;
    if (!amountOk || !orderOk) {
      console.error(
        `[paydunya] commande ${order.id} : paiement incohérent (montant ${result.totalXof} au lieu de ${expected}, commande ${result.orderId})`
      );
      return order.status;
    }
    await db.$transaction([
      db.order.updateMany({ where: { id: order.id, status: "PENDING" }, data: { status: "PAID" } }),
      db.payment.update({ where: { id: payment.id }, data: { status: "SUCCESS" } }),
    ]);
    console.log(`[paydunya] commande ${order.id} payée (${expected} XOF)`);
    return "PAID";
  }

  if (result.status === "cancelled" || result.status === "failed") {
    await db.$transaction([
      db.order.updateMany({ where: { id: order.id, status: "PENDING" }, data: { status: "CANCELLED" } }),
      db.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } }),
    ]);
    return "CANCELLED";
  }

  return order.status;
}
