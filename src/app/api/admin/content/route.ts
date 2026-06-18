import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { bulkUpsertSiteContent, getAllSiteContent } from "@/lib/services/content-service";

/**
 * GET /api/admin/content — tous les textes (admin).
 */
export async function GET() {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  const content = await getAllSiteContent();
  return NextResponse.json({ content });
}

/**
 * PUT /api/admin/content — met à jour plusieurs textes (admin).
 * Body: { entries: [{ key, valueFr, valueEn }] }
 */
export async function PUT(req: NextRequest) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  try {
    const { entries } = await req.json();
    if (!Array.isArray(entries)) {
      return NextResponse.json({ error: "Format invalide" }, { status: 400 });
    }
    await bulkUpsertSiteContent(entries);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/admin/content error:", error);
    return NextResponse.json({ error: "Échec" }, { status: 500 });
  }
}
