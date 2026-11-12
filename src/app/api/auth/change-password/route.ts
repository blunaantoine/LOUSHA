import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/services/auth-service";
import { clientIp, TOO_MANY, MIN_PASSWORD_LENGTH, PASSWORD_TOO_SHORT } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

/** POST /api/auth/change-password — change le mot de passe */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (!(await rateLimit(`change-password:${clientIp(req.headers)}`, 10, 15 * 60 * 1000))) {
      return NextResponse.json({ error: TOO_MANY }, { status: 429 });
    }
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword || typeof currentPassword !== "string" || typeof newPassword !== "string" || newPassword.length > 200) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: PASSWORD_TOO_SHORT }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Vérifie l'ancien mot de passe
    const valid = await verifyPassword(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
    }

    // Hash et sauvegarde le nouveau
    const hashed = await hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/auth/change-password error:", error);
    return NextResponse.json({ error: "Échec" }, { status: 500 });
  }
}
