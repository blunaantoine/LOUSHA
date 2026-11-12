import { NextResponse } from "next/server";
import { isPaymentEnabled } from "@/lib/services/settings-service";

export const dynamic = "force-dynamic";

/** GET /api/settings — réglages publics du site. */
export async function GET() {
  try {
    return NextResponse.json(
      { paymentEnabled: await isPaymentEnabled() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ paymentEnabled: false });
  }
}
