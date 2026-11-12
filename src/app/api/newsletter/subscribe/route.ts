import { NextRequest, NextResponse } from "next/server";
import { subscribeNewsletter } from "@/lib/services/message-service";
import { rateLimit, clientIp, TOO_MANY, isValidEmail } from "@/lib/security";

/** POST /api/newsletter/subscribe — abonne un email */
export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`newsletter:${clientIp(req.headers)}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: TOO_MANY }, { status: 429 });
    }
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }
    await subscribeNewsletter(email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/newsletter/subscribe error:", error);
    return NextResponse.json({ error: "Échec" }, { status: 500 });
  }
}
