import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * POST /api/admin/upload — upload d'une image (multipart/form-data).
 * Stocke le fichier et retourne l'URL publique via /api/uploads/[file].
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await requireStaff())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 });
    }

    // Validation type
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Utilisez JPG, PNG, WebP ou GIF." },
        { status: 400 }
      );
    }

    // Validation taille (~10 Mo)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image trop volumineuse (max 10 Mo)." },
        { status: 400 }
      );
    }

    // Détermine le dossier d'upload
    const baseDir =
      process.env.UPLOAD_DIR ||
      path.join(process.cwd(), "public", "uploads");

    // Crée le dossier s'il n'existe pas
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true, mode: 0o777 });
    }

    // Nom unique
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const filepath = path.join(baseDir, name);

    // Écrit le fichier
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(arrayBuffer));

    // URL publique via la route API /api/uploads/[file]
    return NextResponse.json({ url: `/api/uploads/${name}` });
  } catch (error) {
    console.error("POST /api/admin/upload error:", error);
    const message =
      error instanceof Error ? error.message : "Upload impossible.";
    return NextResponse.json(
      { error: `Upload impossible : ${message}` },
      { status: 500 }
    );
  }
}
