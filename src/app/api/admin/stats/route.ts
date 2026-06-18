import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminStats } from "@/lib/services/admin-service";

/**
 * GET /api/admin/stats — statistiques du tableau de bord.
 * Protégé : requiert une session avec role === "ADMIN".
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
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
