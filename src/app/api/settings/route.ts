import { NextResponse } from "next/server";
import { isMaintenanceEnabled, isPaymentEnabled } from "@/lib/services/settings-service";

export const dynamic = "force-dynamic";

/** GET /api/settings — réglages publics du site. */
export async function GET() {
  try {
    const [paymentEnabled, maintenance] = await Promise.all([
      isPaymentEnabled(),
      isMaintenanceEnabled(),
    ]);
    return NextResponse.json(
      { paymentEnabled, maintenance },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ paymentEnabled: false, maintenance: false });
  }
}
