import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listAllCustomersAdmin } from "@/lib/services/admin-service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
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
