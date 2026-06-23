/**
 * Service IA — Génération de contenu produit à partir d'une image.
 *
 * Fournisseurs supportés (tous gratuits) :
 * 1. Google Gemini 2.0 Flash (prioritaire si GEMINI_API_KEY définie)
 * 2. Mistral Pixtral (fallback si MISTRAL_API_KEY définie)
 * 3. Groq llama-3.2-vision (fallback si GROQ_API_KEY définie)
 *
 * Gratuits :
 *   - Gemini  : https://aistudio.google.com/apikey
 *   - Mistral  : https://console.mistral.ai/api-keys (1 req/sec gratuit)
 *   - Groq    : https://console.groq.com/keys
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY?.trim();
const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim();

const PROMPT = `Tu es un expert en e-commerce pour la marque "Lousha Accessories" qui vend des objets de décoration et accessoires en raphia fait main au Togo.

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

function extractJson(text: string): Record<string, string> {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch { /* fallback */ }
  return {
    name: "Produit Lousha",
    nameEn: "Lousha Product",
    description: text.slice(0, 200) || "Objet de décoration en raphia fait main au Togo.",
    descriptionEn: text.slice(0, 200) || "Handmade raffia decoration from Togo.",
    slug: `produit-${Date.now()}`,
    material: "Raphia 100% naturel",
    craftingTime: "2 jours",
  };
}

async function callGemini(imageBase64: string, mimeType: string): Promise<Record<string, string>> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: mimeType, data: imageBase64 } }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini: ${res.status} — ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return extractJson(text);
}

async function callMistral(imageBase64: string, mimeType: string): Promise<Record<string, string>> {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: "pixtral-12b-2409",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mistral: ${res.status} — ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  return extractJson(text);
}

async function callGroq(imageBase64: string, mimeType: string): Promise<Record<string, string>> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.2-11b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq: ${res.status} — ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  return extractJson(text);
}

/**
 * Essaie les fournisseurs dans l'ordre : Gemini → Mistral → Groq.
 */
export async function generateProductContent(
  imageBase64: string,
  mimeType: string
): Promise<Record<string, string>> {
  // 1. Gemini
  if (GEMINI_API_KEY) {
    try {
      console.log("[ai] Trying Gemini...");
      return await callGemini(imageBase64, mimeType);
    } catch (err) {
      console.warn("[ai] Gemini failed:", err instanceof Error ? err.message : err);
    }
  }

  // 2. Mistral
  if (MISTRAL_API_KEY) {
    try {
      console.log("[ai] Trying Mistral...");
      return await callMistral(imageBase64, mimeType);
    } catch (err) {
      console.warn("[ai] Mistral failed:", err instanceof Error ? err.message : err);
    }
  }

  // 3. Groq
  if (GROQ_API_KEY) {
    try {
      console.log("[ai] Trying Groq...");
      return await callGroq(imageBase64, mimeType);
    } catch (err) {
      console.warn("[ai] Groq failed:", err instanceof Error ? err.message : err);
    }
  }

  const missing: string[] = [];
  if (!GEMINI_API_KEY) missing.push("GEMINI_API_KEY");
  if (!MISTRAL_API_KEY) missing.push("MISTRAL_API_KEY");
  if (!GROQ_API_KEY) missing.push("GROQ_API_KEY");
  throw new Error(
    `Aucune clé IA configurée. Ajoutez ${missing.join(" ou ")} dans .env.\n` +
    `Gratuit : https://console.mistral.ai/api-keys (Mistral) — https://aistudio.google.com/apikey (Gemini)`
  );
}
