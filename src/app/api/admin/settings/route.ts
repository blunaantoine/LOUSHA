import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { setPaymentEnabled } from "@/lib/services/settings-service";

/**
 * PUT /api/admin/settings — modifie les réglages du site (ADMIN uniquement).
 * Body : { paymentEnabled: boolean }
 */
export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) {
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
