import { NextRequest, NextResponse } from "next/server";
import { subscribeNewsletter } from "@/lib/services/message-service";

/** POST /api/newsletter/subscribe — abonne un email */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }
    await subscribeNewsletter(email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/newsletter/subscribe error:", error);
    return NextResponse.json({ error: "Échec" }, { status: 500 });
  }
}
