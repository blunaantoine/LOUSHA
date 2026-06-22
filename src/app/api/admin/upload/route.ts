import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * POST /api/admin/upload — upload d'une image (ADMIN ou MANAGER).
 *
 * Reçoit un FormData avec un champ "file" (image).
 * Sauvegarde le fichier dans UPLOAD_DIR (ou public/uploads par défaut).
 * Retourne { url } — l'URL publique pour accéder à l'image.
 *
 * L'URL utilise /api/uploads/[file] pour servir l'image de façon fiable
 * en production standalone (où le static serving de public/uploads peut
 * ne pas fonctionner selon la config Nginx).
 */
export async function POST(req: NextRequest) {
  // 1. Authentification — ADMIN ou MANAGER uniquement
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    // 2. Parse le FormData
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier reçu" },
        { status: 400 }
      );
    }

    // 3. Valide le type de fichier
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Type non supporté: ${file.type}` },
        { status: 400 }
      );
    }

    // 4. Limite la taille (10 MB max)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 10 MB)" },
        { status: 400 }
      );
    }

    // 5. Génère un nom de fichier unique
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)
      ? ext
      : "jpg";
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${safeExt}`;

    // 6. Détermine le dossier de destination
    // UPLOAD_DIR peut être défini en production (ex: /var/www/lousha/uploads)
    // Sinon on utilise public/uploads dans le projet
    const baseDir =
      process.env.UPLOAD_DIR ||
      path.join(process.cwd(), "public", "uploads");

    // Crée le dossier s'il n'existe pas
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    // 7. Écrit le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = path.join(baseDir, filename);
    fs.writeFileSync(filepath, buffer);

    // 8. Retourne l'URL publique
    // On utilise /api/uploads/[file] pour servir l'image — cette route
    // lit le fichier depuis UPLOAD_DIR (ou public/uploads avec fallbacks).
    // C'est fiable en production standalone car ça ne dépend pas du
    // static serving de Next.js ni de la config Nginx.
    const url = `/api/uploads/${filename}`;

    return NextResponse.json({
      url,
      filename,
      size: file.size,
    });
  } catch (error) {
    console.error("POST /api/admin/upload error:", error);
    return NextResponse.json(
      { error: "Échec de l'upload" },
      { status: 500 }
    );
  }
}
