import { NextRequest, NextResponse } from "next/server";
import { createPasswordReset } from "@/lib/services/auth-service";
import { sendPasswordResetEmail } from "@/lib/services/email-service";

const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Envoie un email avec un lien de réinitialisation (si l'email existe).
 * Toujours renvoie 200 (sécurité : ne pas révéler si l'email existe).
 *
 * Si RESEND_API_KEY n'est pas configuré, le lien de reset est loggué
 * dans la console serveur (mode dev). L'admin peut alors copier le lien
 * depuis les logs du serveur.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email requis." }, { status: 400 });
    }

    const result = await createPasswordReset(email);
    if (result) {
      const emailSent = await sendPasswordResetEmail(email, result.user.name, result.token);

      // Si l'email n'a pas pu être envoyé (pas de clé API Resend),
      // on log le lien de reset dans la console pour que l'admin puisse
      // l'utiliser manuellement. C'est le mécanisme de secours.
      if (!emailSent) {
        const resetLink = `${APP_URL}/auth/reset-password?token=${result.token}`;
        console.log("\n" + "=".repeat(60));
        console.log("⚠️  EMAIL NON ENVOYÉ — RESEND_API_KEY non configuré");
        console.log("📧 Lien de reset (copiez-le dans le navigateur) :");
        console.log(`   ${resetLink}`);
        console.log("=".repeat(60) + "\n");
      }
    }

    // Toujours 200 pour ne pas révéler si l'email existe
    return NextResponse.json({
      ok: true,
      message:
        "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json(
      { error: "Impossible de traiter la demande." },
      { status: 500 }
    );
  }
}
