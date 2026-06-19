import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { listAllUsers, createUserByAdmin } from "@/lib/services/admin-service";

/**
 * GET /api/admin/users — liste tous les utilisateurs (ADMIN uniquement).
 */
export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const users = await listAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/admin/users — crée un utilisateur avec un rôle défini (ADMIN uniquement).
 */
export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const body = await req.json();
    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json(
        { error: "Champs requis : name, email, password, role." },
        { status: 400 }
      );
    }
    if (!["ADMIN", "MANAGER", "CUSTOMER"].includes(body.role)) {
      return NextResponse.json(
        { error: "Rôle invalide (ADMIN, MANAGER ou CUSTOMER)." },
        { status: 400 }
      );
    }
    if (body.password.length < 6) {
      return NextResponse.json(
        { error: "Mot de passe : 6 caractères minimum." },
        { status: 400 }
      );
    }
    const user = await createUserByAdmin(body);
    return NextResponse.json({ user });
  } catch (error) {
    console.error("POST /api/admin/users error:", error);
    const msg = error instanceof Error && error.message.includes("Unique") ? "Email déjà utilisé." : "Création impossible.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
