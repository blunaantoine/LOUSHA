import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { isValidEmail, isText, TOO_MANY } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";
import { verifyPassword } from "@/lib/services/auth-service";

/** PATCH /api/auth/update-profile — met à jour nom, email, téléphone */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Utiliser l'ID du token (fiable) plutôt que l'email (qui peut avoir changé)
    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }

    const { name, email, phone, currentPassword } = await req.json();

    if (
      (name && !isText(name, 100)) ||
      (email && !isValidEmail(email)) ||
      (phone !== undefined && phone !== null && phone !== "" && !isText(phone, 30))
    ) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    // Si l'email change, vérifier qu'il n'est pas déjà utilisé par un autre utilisateur
    if (email && email.toLowerCase() !== session.user.email?.toLowerCase()) {
      const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existing && existing.id !== userId) {
        return NextResponse.json(
          { error: "Cet email est déjà utilisé par un autre compte" },
          { status: 409 }
        );
      }
    }

    // Vérifier que l'utilisateur existe toujours dans la DB
    const currentUser = await db.user.findUnique({ where: { id: userId } });
    if (!currentUser) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Changer d'adresse email revient à changer d'identifiant de connexion :
    // on exige le mot de passe actuel, comme pour un changement de mot de passe.
    const emailChanges = !!email && email.toLowerCase() !== currentUser.email.toLowerCase();
    if (emailChanges) {
      if (!(await rateLimit(`email-change:${userId}`, 10, 15 * 60 * 1000))) {
        return NextResponse.json({ error: TOO_MANY }, { status: 429 });
      }
      const passwordOk =
        typeof currentPassword === "string" &&
        currentPassword.length > 0 &&
        (await verifyPassword(currentPassword, currentUser.password));
      if (!passwordOk) {
        return NextResponse.json(
          { error: "Mot de passe actuel requis pour changer d'email", code: "PASSWORD_REQUIRED" },
          { status: 403 }
        );
      }
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email: email.toLowerCase() }),
        ...(phone !== undefined && { phone }),
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("PATCH /api/auth/update-profile error:", error);
    return NextResponse.json({ error: "Échec de la mise à jour" }, { status: 500 });
  }
}
