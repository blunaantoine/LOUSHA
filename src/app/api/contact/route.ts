import { NextRequest, NextResponse } from "next/server";
import { createContactMessage } from "@/lib/services/message-service";
import { rateLimit, clientIp, TOO_MANY, isValidEmail, isText } from "@/lib/security";

/** POST /api/contact — sauvegarde un message de contact */
export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`contact:${clientIp(req.headers)}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: TOO_MANY }, { status: 429 });
    }
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }
    if (!isText(name, 100) || !isValidEmail(email) || !isText(message, 5000)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    await createContactMessage(name.trim(), email.trim(), message.trim());
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json({ error: "Échec" }, { status: 500 });
  }
}
