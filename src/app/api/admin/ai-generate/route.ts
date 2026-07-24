import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import fs from "fs";
import path from "path";
import { generateProductContent, generatePromoContent } from "@/lib/services/ai-service";

/**
 * POST /api/admin/ai-generate
 * Body: { imageUrl: "/api/uploads/xxx.png", mode?: "product"|"promo" }
 * Analyse l'image avec IA et génère le contenu.
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await requireStaff())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { imageUrl, mode } = await req.json();
    if (!imageUrl) {
      return NextResponse.json({ error: "Image requise" }, { status: 400 });
    }

    const fileName = imageUrl.split("/").pop();
    if (!fileName || fileName.includes("..") || fileName.includes("/")) {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }

    // Cherche le fichier dans les mêmes dossiers que l'API upload
    const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
    const searchPaths = [
      path.join(uploadDir, fileName),                                                        // UPLOAD_DIR
      path.join(process.cwd(), "public", "uploads", fileName),                               // dev
      path.join(process.cwd(), ".next", "standalone", "public", "uploads", fileName),        // prod standalone (build copy)
      path.join(process.cwd(), "upload", fileName),                                          // config custom
      path.join(process.cwd(), ".next", "standalone", "upload", fileName),                   // prod standalone custom
    ];

    let imagePath: string | null = null;
    for (const p of searchPaths) {
      try {
        if (fs.existsSync(p)) {
          imagePath = p;
          console.log("[ai-generate] Found image at:", p);
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
      // Fallback : télécharge l'image via l'API interne
      console.log("[ai-generate] File not found on disk, trying HTTP fallback for:", fileName);
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3004";
      const fullUrl = imageUrl.startsWith("http") ? imageUrl : `${baseUrl}${imageUrl}`;
      try {
        const imgRes = await fetch(fullUrl, { signal: AbortSignal.timeout(5000) });
        if (!imgRes.ok) {
          console.error("[ai-generate] HTTP fallback failed:", imgRes.status);
          return NextResponse.json({ error: "Image introuvable (fichier + HTTP échoués)" }, { status: 404 });
        }
        const arrayBuf = await imgRes.arrayBuffer();
        base64Image = Buffer.from(arrayBuf).toString("base64");
        mimeType = imgRes.headers.get("content-type") || "image/png";
      } catch (fetchErr) {
        console.error("[ai-generate] HTTP fallback fetch error:", fetchErr);
        return NextResponse.json(
          { error: "Image introuvable — ni sur disque ni via HTTP. Vérifiez UPLOAD_DIR." },
          { status: 404 }
        );
      }
    }

    // Appelle l'IA selon le mode
    const generated = mode === "promo"
      ? await generatePromoContent(base64Image, mimeType)
      : await generateProductContent(base64Image, mimeType);

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
