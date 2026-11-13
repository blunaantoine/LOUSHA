import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncPaydunyaOrder } from "@/lib/services/paydunya-service";

/**
 * POST /api/payments/paydunya/ipn — notification de paiement envoyée par PayDunya.
 *
 * Le contenu de la notification n'est pas cru sur parole : on en extrait
 * seulement le jeton de la facture, puis on interroge PayDunya avec nos clés
 * privées (syncPaydunyaOrder). Une fausse notification ne peut donc rien
 * valider ; au pire elle déclenche une vérification inutile.
 */
export async function POST(req: NextRequest) {
  try {
    const token = await extractToken(req);
    if (!token) return NextResponse.json({ ok: false }, { status: 400 });

    const payment = await db.payment.findFirst({
      where: { provider: "PAYDUNYA", transactionId: token },
      select: { orderId: true },
    });
    if (!payment) return NextResponse.json({ ok: false }, { status: 404 });

    const status = await syncPaydunyaOrder(payment.orderId);
    return NextResponse.json({ ok: true, status });
  } catch (error) {
    console.error("POST /api/payments/paydunya/ipn error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/** Jeton de facture, que la notification soit envoyée en JSON ou en formulaire. */
async function extractToken(req: NextRequest): Promise<string | null> {
  const valid = (t: unknown) =>
    typeof t === "string" && /^[A-Za-z0-9_-]{4,100}$/.test(t) ? t : null;
  const text = await req.text();
  if (!text) return null;

  try {
    const json = JSON.parse(text);
    const d = json?.data ?? json;
    return valid(d?.invoice?.token) ?? valid(d?.token) ?? null;
  } catch {
    // pas du JSON : formulaire (data[invoice][token]=... ou data={json})
  }
  const form = new URLSearchParams(text);
  const direct =
    valid(form.get("data[invoice][token]")) ??
    valid(form.get("invoice[token]")) ??
    valid(form.get("token"));
  if (direct) return direct;
  const data = form.get("data");
  if (data) {
    try {
      const d = JSON.parse(data);
      return valid(d?.invoice?.token) ?? valid(d?.token) ?? null;
    } catch {
      return null;
    }
  }
  return null;
}
