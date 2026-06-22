/**
 * Service IA — Google Gemini API (gratuit, accessible depuis n'importe quel serveur).
 * Analyse d'images de produits pour générer nom, description, slug.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export async function generateProductContent(imageBase64: string, mimeType: string) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY non configuré");
  }

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

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
    },
  };

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[gemini] API error:", err);
    throw new Error(`Gemini API: ${res.status}`);
  }

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Extrait le JSON
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

  return generated;
}
