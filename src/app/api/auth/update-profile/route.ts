import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/** PATCH /api/auth/update-profile — met à jour nom, email, téléphone */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { name, email, phone } = await req.json();

    // Si l'email change, vérifier qu'il n'est pas déjà utilisé
    if (email && email !== session.user.email) {
      const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
      if (existing) {
        return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
      }
    }

    const updated = await db.user.update({
      where: { email: session.user.email },
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
