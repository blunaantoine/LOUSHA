import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { updateUserRole, setUserBlocked, deleteUser } from "@/lib/services/admin-service";

/**
 * PATCH /api/admin/users/[id] — modifie le rôle ou le statut bloqué.
 * Body : { role?: "ADMIN"|"MANAGER"|"CUSTOMER", blocked?: boolean }
 * ADMIN uniquement.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json();

    if (body.role !== undefined) {
      if (!["ADMIN", "MANAGER", "CUSTOMER"].includes(body.role)) {
        return NextResponse.json(
          { error: "Rôle invalide (ADMIN, MANAGER ou CUSTOMER)." },
          { status: 400 }
        );
      }
      const user = await updateUserRole(id, body.role);
      return NextResponse.json({ user });
    }

    if (body.blocked !== undefined) {
      const user = await setUserBlocked(id, Boolean(body.blocked));
      return NextResponse.json({ user });
    }

    return NextResponse.json({ error: "Rien à modifier." }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Modification impossible." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/[id] — supprime un utilisateur (ADMIN uniquement).
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const { id } = await params;
    await deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
