import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { getAdminStats } from "@/lib/services/admin-service";

/**
 * GET /api/admin/stats — statistiques du tableau de bord.
 * Protégé : requiert un rôle ADMIN ou MANAGER.
 */
export async function GET() {
  try {
    if (!(await requireStaff())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const stats = await getAdminStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { error: "Impossible de charger les statistiques." },
      { status: 500 }
    );
  }
}
