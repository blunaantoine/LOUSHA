import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireAdmin, requireStaff } from "@/lib/guards";
import { updateOrderStatus } from "@/lib/services/order-service";

/**
 * PATCH /api/admin/orders/[id] — change le statut d'une commande.
 * Body: { status: "PENDING" | "CONFIRMED" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED" }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  try {
    const { id } = await params;
    const { status } = await req.json();

    const validStatuses = ["PENDING", "CONFIRMED", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const order = await updateOrderStatus(id, status as "PENDING" | "CONFIRMED" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED");
    return NextResponse.json({ order });
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id] error:", error);
    return NextResponse.json({ error: "Échec" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/orders/[id] — supprime définitivement une commande, avec
 * ses articles et son paiement (ADMIN uniquement, pas les gestionnaires).
 * Prévu pour retirer les commandes de test des statistiques de vente.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  try {
    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      select: { id: true, totalCents: true, status: true, fullName: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }
    // Articles et paiement supprimés en cascade (onDelete: Cascade)
    await db.order.delete({ where: { id } });
    const session = await getServerSession(authOptions);
    console.warn(
      `[commandes] commande ${order.id} supprimée (${order.status}, ${Math.round(order.totalCents / 100)} XOF, ${order.fullName}) par ${(session?.user as { email?: string } | undefined)?.email ?? "?"}`
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/orders/[id] error:", error);
    return NextResponse.json({ error: "Suppression impossible" }, { status: 500 });
  }
}
