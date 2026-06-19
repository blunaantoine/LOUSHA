import { NextRequest, NextResponse } from "next/server";
import { createPasswordReset } from "@/lib/services/auth-service";
import { sendPasswordResetEmail } from "@/lib/services/email-service";

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Envoie un email avec un lien de réinitialisation (si l'email existe).
 * Toujours renvoie 200 (sécurité : ne pas révéler si l'email existe).
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email requis." }, { status: 400 });
    }

    const result = await createPasswordReset(email);
    if (result) {
      await sendPasswordResetEmail(email, result.user.name, result.token);
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
