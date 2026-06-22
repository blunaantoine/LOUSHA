import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import fs from "fs";
import path from "path";
import { generateProductContent } from "@/lib/services/ai-service";

/**
 * POST /api/admin/ai-generate
 * Body: { imageUrl: "/api/uploads/xxx.png" }
 * Analyse l'image avec Google Gemini et génère le contenu du produit.
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await requireStaff())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { imageUrl } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ error: "Image requise" }, { status: 400 });
    }

    const fileName = imageUrl.split("/").pop();
    if (!fileName) {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }

    // Cherche le fichier
    const searchPaths = [
      process.env.UPLOAD_DIR ? path.join(process.env.UPLOAD_DIR, fileName) : null,
      path.join(process.cwd(), "public", "uploads", fileName),
      path.join(process.cwd(), ".next", "standalone", "public", "uploads", fileName),
      "/var/www/lousha/public/uploads/" + fileName,
    ].filter(Boolean) as string[];

    let imagePath: string | null = null;
    for (const p of searchPaths) {
      try {
        if (fs.existsSync(p)) {
          imagePath = p;
          break;
        }
      } catch {
        // continue
      }
    }

    let base64Image: string;
    let mimeType: string;

    if (imagePath) {
      const imageBuffer = fs.readFileSync(imagePath);
      base64Image = imageBuffer.toString("base64");
      const ext = fileName.split(".").pop()?.toLowerCase() || "png";
      mimeType =
        ext === "jpg" || ext === "jpeg" ? "image/jpeg"
        : ext === "webp" ? "image/webp"
        : ext === "gif" ? "image/gif"
        : "image/png";
    } else {
      // Fallback : télécharge l'image depuis l'URL
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3004";
      const fullUrl = imageUrl.startsWith("http") ? imageUrl : baseUrl + imageUrl;
      const imgRes = await fetch(fullUrl);
      if (!imgRes.ok) {
        return NextResponse.json({ error: "Image introuvable" }, { status: 404 });
      }
      const arrayBuf = await imgRes.arrayBuffer();
      base64Image = Buffer.from(arrayBuf).toString("base64");
      mimeType = imgRes.headers.get("content-type") || "image/png";
    }

    // Appelle Gemini
    const generated = await generateProductContent(base64Image, mimeType);

    return NextResponse.json({ generated });
  } catch (error) {
    console.error("[ai-generate] Error:", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: `Génération IA échouée: ${message}` },
      { status: 500 }
    );
  }
}
