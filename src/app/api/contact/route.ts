import { NextRequest, NextResponse } from "next/server";
import { createContactMessage } from "@/lib/services/message-service";

/** POST /api/contact — sauvegarde un message de contact */
export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }
    await createContactMessage(name, email, message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json({ error: "Échec" }, { status: 500 });
  }
}
