import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import fs from "fs";
import path from "path";
import ZAI from "z-ai-web-dev-sdk";

/**
 * POST /api/admin/ai-generate
 * Body: { imageUrl: "/api/uploads/xxx.png" }
 * Analyse l'image avec l'IA (VLM) et génère :
 * - name (FR), nameEn (EN)
 * - description (FR), descriptionEn (EN)
 * - slug
 * - material, origin, craftingTime (suggestions)
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

    // Lit le fichier image et le convertit en base64
    const fileName = imageUrl.split("/").pop();
    if (!fileName) {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }

    // Cherche le fichier dans plusieurs endroits possibles
    const possiblePaths = [
      process.env.UPLOAD_DIR
        ? path.join(process.env.UPLOAD_DIR, fileName)
        : null,
      path.join(process.cwd(), "public", "uploads", fileName),
      path.join(process.cwd(), ".next", "standalone", "public", "uploads", fileName),
    ].filter(Boolean) as string[];

    let imagePath: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        imagePath = p;
        break;
      }
    }

    if (!imagePath) {
      return NextResponse.json({ error: "Image introuvable" }, { status: 404 });
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");
    const ext = fileName.split(".").pop()?.toLowerCase() || "png";
    const mimeType = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;

    // Appelle le VLM pour analyser l'image et générer le contenu
    const zai = await ZAI.create();
    const prompt = `Tu es un expert en e-commerce pour la marque "Lousha Accessories" qui vend des objets de décoration et accessoires en raphia fait main au Togo.

Analyse cette image de produit et génère un JSON avec ce format exact :
{
  "name": "Nom du produit en français (court, élégant, ex: Panier Jardin)",
  "nameEn": "Product name in English (short, elegant, ex: Garden Basket)",
  "description": "Description en français (2-3 phrases, met en avant la matière raphia naturel, le fait main, le Togo, l'authenticité)",
  "descriptionEn": "Description in English (2-3 sentences, highlights natural raffia, handmade, Togo, authenticity)",
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

    // Extrait le JSON de la réponse
    let jsonStr = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    let generated;
    try {
      generated = JSON.parse(jsonStr);
    } catch {
      // Si le parsing échoue, utilise le texte brut
      generated = {
        name: "Produit Lousha",
        nameEn: "Lousha Product",
        description: content.slice(0, 200),
        descriptionEn: content.slice(0, 200),
        slug: `produit-${Date.now()}`,
        material: "Raphia 100% naturel",
        craftingTime: "2 jours",
      };
    }

    return NextResponse.json({ generated });
  } catch (error) {
    console.error("POST /api/admin/ai-generate error:", error);
    return NextResponse.json(
      { error: "Génération IA échouée" },
      { status: 500 }
    );
  }
}
