import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { replyToMessage, getMessage } from "@/lib/services/message-service";

/**
 * POST /api/admin/messages/[id]/reply
 * Body: { reply: "texte de la réponse" }
 * Envoie un email au client via Resend + met à jour le message en DB.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { reply } = await req.json();

    if (!reply || !reply.trim()) {
      return NextResponse.json({ error: "Réponse vide" }, { status: 400 });
    }

    const message = await getMessage(id);
    if (!message) {
      return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
    }

    // Envoie l'email via Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const EMAIL_FROM =
      process.env.EMAIL_FROM || "Lousha Accessories <noreply@loushatg.duckdns.org>";

    if (RESEND_API_KEY) {
      const html = `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 28px; letter-spacing: 0.1em; margin: 0;">LOUSHA</h1>
            <p style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #5A5A5A; margin-top: 4px;">Accessories</p>
          </div>
          <h2 style="color: #111;">Réponse à votre message</h2>
          <p style="color: #5A5A5A; line-height: 1.6;">Bonjour ${message.name},</p>
          <p style="color: #5A5A5A; line-height: 1.6;">Vous nous avez écrit :</p>
          <blockquote style="border-left: 3px solid #311B00; padding-left: 16px; margin: 16px 0; color: #5A5A5A; font-style: italic;">
            ${message.message}
          </blockquote>
          <p style="color: #111; line-height: 1.6;">${reply.replace(/\n/g, "<br>")}</p>
          <hr style="border: none; border-top: 1px solid #E5E5E8; margin: 30px 0;" />
          <p style="color: #5A5A5A; font-size: 12px; text-align: center;">
            Lousha Accessories — Made in Togo · Raphia fait main
          </p>
        </div>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: [message.email],
          subject: "Lousha Accessories — Réponse à votre message",
          html,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("[reply] Resend error:", err);
        // On marque quand même comme répondu même si l'email échoue
        await replyToMessage(id, reply);
        return NextResponse.json({
          ok: true,
          warning: "Email non envoyé (domaine non vérifié ?) mais réponse enregistrée.",
        });
      }
    } else {
      console.log("[reply] Mode dev — pas de token Resend. Réponse:", reply);
    }

    // Marque le message comme répondu
    await replyToMessage(id, reply);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST reply error:", error);
    return NextResponse.json({ error: "Échec" }, { status: 500 });
  }
}
