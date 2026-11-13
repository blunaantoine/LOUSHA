/**
 * Service Commandes — création et lecture des commandes.
 *
 * Prépare le terrain pour le tunnel d'achat réel : quand un paiement sera
 * confirmé (PayGate/FedaPay/Stripe futur), on appellera `createOrder` pour
 * persister la commande, ses lignes et le paiement associé.
 *
 * Pour l'instant le checkout reste simulé côté client, mais cette couche
 * existe déjà pour brancher un vrai provider sans tout réécrire.
 */
import { db } from "@/lib/db";

export interface OrderLineInput {
  slug: string;
  name: string;
  priceCents: number;
  qty: number;
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface CreateOrderInput {
  userId?: string | null;
  email: string;
  fullName: string;
  phone?: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  lines: OrderLineInput[];
  shippingCents: number;
  totalCents: number;
  paymentProvider?: string;
  paymentTransactionId?: string;
}

export async function createOrder(input: CreateOrderInput) {
  const order = await db.order.create({
    data: {
      userId: input.userId ?? null,
      email: input.email,
      fullName: input.fullName,
      phone: input.phone ?? null,
      address: input.address,
      city: input.city,
      zip: input.zip,
      country: input.country,
      shippingCents: input.shippingCents,
      totalCents: input.totalCents,
      status: input.paymentTransactionId ? "PAID" : "PENDING",
      items: {
        create: input.lines.map((l) => ({
          slug: l.slug,
          name: l.name,
          priceCents: l.priceCents,
          qty: l.qty,
        })),
      },
      payment: input.paymentTransactionId
        ? {
            create: {
              provider: input.paymentProvider ?? "SIMULATED",
              transactionId: input.paymentTransactionId,
              status: "SUCCESS",
            },
          }
        : undefined,
    },
    include: { items: true, payment: true },
  });
  return order;
}

export async function listOrdersByEmail(email: string) {
  return db.order.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}

export async function listAllOrders() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, payment: true },
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return db.order.update({ where: { id }, data: { status } });
}

/* ============ Lignes de commande à partir du panier ============ */

type RawCartItem = { slug?: unknown; priceCents?: unknown; qty?: unknown };

/**
 * Construit les lignes de commande à partir du panier envoyé par le navigateur.
 *
 * Les noms et les prix viennent de la base de données, jamais du navigateur.
 * Le prix envoyé sert uniquement à identifier la variante choisie : il doit
 * correspondre au prix du produit ou à celui d'une de ses variantes actives.
 */
export async function buildOrderLines(
  items: unknown
): Promise<{ ok: true; lines: OrderLineInput[] } | { ok: false; error: string }> {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return { ok: false, error: "Panier vide" };
  }
  const raw = items as RawCartItem[];
  const slugs = [
    ...new Set(raw.map((i) => i?.slug).filter((s): s is string => typeof s === "string")),
  ];
  const products = await db.product.findMany({
    where: { slug: { in: slugs } },
    select: {
      slug: true,
      name: true,
      priceCents: true,
      variants: { where: { active: true }, select: { priceCents: true } },
    },
  });
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const lines: OrderLineInput[] = [];
  for (const item of raw) {
    const product = typeof item?.slug === "string" ? bySlug.get(item.slug) : undefined;
    const qty = Number(item?.qty);
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 100) {
      return { ok: false, error: "Article invalide" };
    }
    const allowed = [product.priceCents, ...product.variants.map((v) => v.priceCents)];
    const priceCents = Number(item.priceCents);
    if (!allowed.includes(priceCents)) {
      return { ok: false, error: "Prix invalide" };
    }
    lines.push({ slug: product.slug, name: product.name, priceCents, qty });
  }
  return { ok: true, lines };
}
