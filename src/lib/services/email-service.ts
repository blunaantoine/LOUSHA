/**
 * Service Email — envoi d'emails via Resend.
 *
 * Utilisé pour le mot de passe oublié.
 * Configurez RESEND_API_KEY et EMAIL_FROM dans .env.production.
 */
import crypto from "crypto";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM =
  process.env.EMAIL_FROM || "Lousha Accessories <noreply@loushatg.duckdns.org>";
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<boolean> {
  if (!RESEND_API_KEY) {
    // Mode dev : on log le lien au lieu d'envoyer un email
    const resetLink = `${APP_URL}/auth/reset-password?token=${token}`;
    console.log("[email] (mode dev) Lien reset mot de passe:", resetLink);
    return true;
  }

  const resetLink = `${APP_URL}/auth/reset-password?token=${token}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 28px; letter-spacing: 0.1em; margin: 0;">LOUSHA</h1>
        <p style="font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #5A5A5A; margin-top: 4px;">Accessories</p>
      </div>
      <h2 style="color: #111111;">Réinitialisation de votre mot de passe</h2>
      <p style="color: #5A5A5A; line-height: 1.6;">Bonjour ${name},</p>
      <p style="color: #5A5A5A; line-height: 1.6;">
        Vous avez demandé à réinitialiser votre mot de passe Lousha Accessories.
        Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background: #311B00; color: #FFFFFF; padding: 14px 32px; text-decoration: none; border-radius: 999px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; display: inline-block;">
          Réinitialiser mon mot de passe
        </a>
      </div>
      <p style="color: #5A5A5A; line-height: 1.6; font-size: 13px;">
        Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email — votre mot de passe restera inchangé.
      </p>
      <hr style="border: none; border-top: 1px solid #E5E5E8; margin: 30px 0;" />
      <p style="color: #5A5A5A; font-size: 12px; text-align: center;">
        Lousha Accessories — Made in Togo · Raphia fait main
      </p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [email],
        subject: "Lousha Accessories — Réinitialisation de mot de passe",
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[email] Resend error:", err);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] send error:", error);
    return false;
  }
}

/**
 * Génère un token aléatoire sécurisé pour la réinitialisation.
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
