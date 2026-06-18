import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { listAllOrdersAdmin } from "@/lib/services/admin-service";

export async function GET() {
  try {
    if (!(await requireStaff())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const orders = await listAllOrdersAdmin();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json(
      { error: "Impossible de charger les commandes." },
      { status: 500 }
    );
  }
}
