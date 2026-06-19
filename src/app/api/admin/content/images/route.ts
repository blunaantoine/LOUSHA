import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { bulkUpsertSiteImages, getAllSiteImages } from "@/lib/services/content-service";

/**
 * GET /api/admin/content/images — toutes les images (admin).
 */
export async function GET() {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  const images = await getAllSiteImages();
  return NextResponse.json({ images });
}

/**
 * PUT /api/admin/content/images — met à jour plusieurs images (admin).
 * Body: { entries: [{ key, url }] }
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
    await bulkUpsertSiteImages(entries);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PUT /api/admin/content/images error:", error);
    return NextResponse.json({ error: "Échec" }, { status: 500 });
  }
}
