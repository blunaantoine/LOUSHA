import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { listAllCustomersAdmin } from "@/lib/services/admin-service";

export async function GET() {
  try {
    if (!(await requireStaff())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const customers = await listAllCustomersAdmin();
    return NextResponse.json({ customers });
  } catch (error) {
    console.error("GET /api/admin/customers error:", error);
    return NextResponse.json(
      { error: "Impossible de charger les clients." },
      { status: 500 }
    );
  }
}
