import { NextRequest, NextResponse } from "next/server";
import { requireOwnerAdmin } from "@/lib/guards";
import { isPaymentEnabled, setPaymentEnabled } from "@/lib/services/settings-service";
import { isPaydunyaConfigured, isPaydunyaLive } from "@/lib/services/paydunya-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/settings — réglage du paiement en ligne (comptes autorisés).
 * Répond 403 aux autres comptes : l'interrupteur reste alors caché.
 */
export async function GET() {
  if (!(await requireOwnerAdmin())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  return NextResponse.json(
    {
      paymentSetting: await isPaymentEnabled(),
      paydunyaConfigured: isPaydunyaConfigured(),
      paydunyaLive: isPaydunyaLive(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

/**
 * PUT /api/admin/settings — active ou désactive le paiement en ligne
 * (comptes autorisés uniquement). Body : { paymentEnabled: boolean }
 */
export async function PUT(req: NextRequest) {
  if (!(await requireOwnerAdmin())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  try {
    const { paymentEnabled } = await req.json();
    if (typeof paymentEnabled !== "boolean") {
      return NextResponse.json({ error: "Valeur invalide" }, { status: 400 });
    }
    return NextResponse.json({ paymentEnabled: await setPaymentEnabled(paymentEnabled) });
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json({ error: "Échec" }, { status: 500 });
  }
}
