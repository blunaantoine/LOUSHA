import { NextRequest, NextResponse } from "next/server";
import { resetPassword, verifyResetToken } from "@/lib/services/auth-service";

/**
 * POST /api/auth/reset-password
 * Body: { token, password }
 * Vérifie le token et change le mot de passe.
 */
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token et mot de passe requis." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit faire au moins 6 caractères." },
        { status: 400 }
      );
    }

    const valid = await verifyResetToken(token);
    if (!valid) {
      return NextResponse.json(
        { error: "Token invalide ou expiré." },
        { status: 400 }
      );
    }

    const ok = await resetPassword(token, password);
    if (!ok) {
      return NextResponse.json(
        { error: "Réinitialisation impossible." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error);
    return NextResponse.json(
      { error: "Impossible de réinitialiser le mot de passe." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/reset-password?token=xxx
 * Vérifie si un token est valide (sans changer le mot de passe).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.json({ valid: false });
    }
    const user = await verifyResetToken(token);
    return NextResponse.json({ valid: !!user });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
