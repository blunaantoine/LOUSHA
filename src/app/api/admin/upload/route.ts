import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * POST /api/admin/upload — upload d'une image (multipart/form-data).
 * Stocke le fichier dans /public/uploads/ et retourne l'URL publique.
 * Protégé : ADMIN uniquement.
 *
 * Champs attendus : "file" (image, max ~5 Mo).
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

    // Validation taille (~5 Mo)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image trop volumineuse (max 5 Mo)." },
        { status: 400 }
      );
    }

    // Prépare le dossier
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Nom unique
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const filepath = path.join(uploadDir, name);

    // Écrit le fichier
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(arrayBuffer));

    return NextResponse.json({ url: `/uploads/${name}` });
  } catch (error) {
    console.error("POST /api/admin/upload error:", error);
    return NextResponse.json(
      { error: "Upload impossible." },
      { status: 500 }
    );
  }
}
