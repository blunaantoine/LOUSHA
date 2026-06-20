import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import fs from "fs";
import path from "path";
import ZAI from "z-ai-web-dev-sdk";

/**
 * POST /api/admin/ai-generate
 * Body: { imageUrl: "/api/uploads/xxx.png" }
 * Analyse l'image avec l'IA (VLM) et génère le contenu du produit.
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

    // Récupère le nom du fichier depuis l'URL
    const fileName = imageUrl.split("/").pop();
    if (!fileName) {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }

    // Cherche le fichier dans TOUS les emplacements possibles
    const searchPaths = [
      process.env.UPLOAD_DIR
        ? path.join(process.env.UPLOAD_DIR, fileName)
        : null,
      path.join(process.cwd(), "public", "uploads", fileName),
      path.join(process.cwd(), ".next", "standalone", "public", "uploads", fileName),
      "/var/www/lousha/public/uploads/" + fileName,
    ].filter(Boolean) as string[];

    let imagePath: string | null = null;
    let searchLog: string[] = [];
    for (const p of searchPaths) {
      searchLog.push(p);
      try {
        if (fs.existsSync(p)) {
          imagePath = p;
          break;
        }
      } catch {
        // continue
      }
    }

    if (!imagePath) {
      console.error("[ai-generate] Image not found locally. Searched:", searchLog);
      // Fallback : télécharge l'image depuis l'URL publique
      try {
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3004";
        const fullUrl = imageUrl.startsWith("http") ? imageUrl : baseUrl + imageUrl;
        console.log("[ai-generate] Trying fetch from:", fullUrl);
        const imgRes = await fetch(fullUrl);
        if (imgRes.ok) {
          const arrayBuf = await imgRes.arrayBuffer();
          const buf = Buffer.from(arrayBuf);
          const b64 = buf.toString("base64");
          const ct = imgRes.headers.get("content-type") || "image/png";
          return await generateContent(b64, ct);
        }
      } catch (fetchErr) {
        console.error("[ai-generate] Fetch fallback failed:", fetchErr);
      }
      return NextResponse.json({
        error: "Image introuvable. Chemins testés: " + searchLog.join(", ")
      }, { status: 404 });
    }

    // Lit et convertit l'image en base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");
    const ext = fileName.split(".").pop()?.toLowerCase() || "png";
    const mimeType =
      ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "webp"
        ? "image/webp"
        : ext === "gif"
        ? "image/gif"
        : "image/png";

    // Appelle la fonction de génération
    return await generateContent(base64Image, mimeType);
  } catch (error) {
    console.error("[ai-generate] Error:", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json(
      { error: `Génération IA échouée: ${message}` },
      { status: 500 }
    );
  }
}

// Fonction helper qui génère le contenu à partir d'une image base64
async function generateContent(base64Image: string, mimeType: string) {
  const zai = await ZAI.create();

  const prompt = `Tu es un expert en e-commerce pour la marque "Lousha Accessories" qui vend des objets de décoration et accessoires en raphia fait main au Togo.

Analyse cette image de produit et génère un JSON avec ce format exact :
{
  "name": "Nom du produit en français (court, élégant)",
  "nameEn": "Product name in English (short, elegant)",
  "description": "Description en français (2-3 phrases, met en avant le raphia naturel, le fait main, le Togo)",
  "descriptionEn": "Description in English (2-3 sentences, highlights natural raffia, handmade, Togo)",
  "slug": "slug-en-minuscules-avec-tirets",
  "material": "Raphia 100% naturel",
  "craftingTime": "temps estimé (ex: 2 jours)"
}

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`;

  const response = await zai.chat.completions.createVision({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    thinking: { type: "disabled" },
  });

  const content = response.choices[0]?.message?.content || "";

  let generated;
  try {
    let jsonStr = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    generated = JSON.parse(jsonStr);
  } catch {
    generated = {
      name: "Produit Lousha",
      nameEn: "Lousha Product",
      description: content.slice(0, 200) || "Objet de décoration en raphia fait main au Togo.",
      descriptionEn: content.slice(0, 200) || "Handmade raffia decoration from Togo.",
      slug: `produit-${Date.now()}`,
      material: "Raphia 100% naturel",
      craftingTime: "2 jours",
    };
  }

  return NextResponse.json({ generated });
}
