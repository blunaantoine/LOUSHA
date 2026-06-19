import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
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
