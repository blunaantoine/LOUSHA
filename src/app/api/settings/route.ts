import { NextResponse } from "next/server";
import { isMaintenanceEnabled, isPaymentEnabled } from "@/lib/services/settings-service";
import { isPaydunyaConfigured, isPaydunyaLive } from "@/lib/services/paydunya-service";

export const dynamic = "force-dynamic";

/** GET /api/settings — réglages publics du site. */
export async function GET() {
  try {
    const [paymentSetting, maintenance] = await Promise.all([
      isPaymentEnabled(),
      isMaintenanceEnabled(),
    ]);
    const paydunyaConfigured = isPaydunyaConfigured();
    return NextResponse.json(
      {
        // Le paiement en ligne n'est proposé que s'il est activé ET configuré.
        paymentEnabled: paymentSetting && paydunyaConfigured,
        paymentSetting,
        paydunyaConfigured,
        paydunyaLive: isPaydunyaLive(),
        maintenance,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ paymentEnabled: false, maintenance: false });
  }
}
