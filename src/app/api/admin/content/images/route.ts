import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { bulkUpsertSiteImages, deleteSiteImage, getAllSiteImages } from "@/lib/services/content-service";
import fs from "fs";
import path from "path";

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

/**
 * DELETE /api/admin/content/images?key=story-1 — supprime une image (admin).
 * Supprime l'entrée en DB et tente de supprimer le fichier physique associé.
 */
export async function DELETE(req: NextRequest) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  try {
    const key = req.nextUrl.searchParams.get("key");
    if (!key) {
      return NextResponse.json({ error: "Paramètre 'key' requis" }, { status: 400 });
    }

    // 1. Supprime l'entrée en DB et récupère l'URL du fichier
    const deletedUrl = await deleteSiteImage(key);
    if (!deletedUrl) {
      // Déjà supprimée — pas une erreur
      return NextResponse.json({ ok: true, alreadyDeleted: true });
    }

    // 2. Tente de supprimer le fichier physique (si c'est un upload local)
    try {
      if (deletedUrl.startsWith("/uploads/") || deletedUrl.startsWith("/api/uploads/")) {
        const filename = deletedUrl.split("/").pop();
        if (filename && !filename.includes("..") && !filename.includes("/")) {
          const baseDir =
            process.env.UPLOAD_DIR ||
            path.join(process.cwd(), "public", "uploads");
          const filepath = path.join(baseDir, filename);
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
          }
        }
      }
    } catch {
      // Ne pas échouer si le fichier ne peut pas être supprimé
    }

    return NextResponse.json({ ok: true, deletedUrl });
  } catch (error) {
    console.error("DELETE /api/admin/content/images error:", error);
    return NextResponse.json({ error: "Échec" }, { status: 500 });
  }
}
