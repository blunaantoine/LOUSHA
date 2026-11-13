import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, TOO_MANY } from "@/lib/security";
import { syncPaydunyaOrder } from "@/lib/services/paydunya-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/payments/paydunya/status?order=ID
 * État d'une commande payée en ligne, après vérification auprès de PayDunya.
 * Utilisé par la page de retour après paiement.
 */
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order");
  if (!orderId || !/^[a-z0-9]{10,40}$/i.test(orderId)) {
    return NextResponse.json({ error: "Commande invalide" }, { status: 400 });
  }
  if (!(await rateLimit(`paydunya-status:${clientIp(req.headers)}`, 60, 15 * 60 * 1000))) {
    return NextResponse.json({ error: TOO_MANY }, { status: 429 });
  }
  try {
    const status = await syncPaydunyaOrder(orderId);
    if (!status) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    return NextResponse.json({ status }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/payments/paydunya/status error:", error);
    return NextResponse.json({ status: "PENDING", retry: true });
  }
}
