/**
 * Service IA — Analyse d'image et génération de contenu.
 *
 * Fournisseurs (gratuits, fallback automatique) :
 * 1. Mistral Pixtral 2. Gemini 2.0 Flash  3. Groq llama-3.2-vision
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY?.trim();
const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim();

function extractJson(text: string): Record<string, string> {
  try {
    const m = text.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : { titleFr: "Nouveauté", titleEn: "New Arrival" };
  } catch {
    return { titleFr: "Nouveauté", titleEn: "New Arrival" };
  }
}

async function callGemini(imageBase64: string, mimeType: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: imageBase64 } }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini: ${res.status}`);
  const data = await res.json();
  return extractJson(data.candidates?.[0]?.content?.parts?.[0]?.text || "");
}

async function callMistral(imageBase64: string, mimeType: string, prompt: string) {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${MISTRAL_API_KEY}` },
    body: JSON.stringify({
      model: "pixtral-12b-2409",
      messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } }] }],
      temperature: 0.7, max_tokens: 1000,
    }),
  });
  if (!res.ok) throw new Error(`Mistral: ${res.status}`);
  const data = await res.json();
  return extractJson(data.choices?.[0]?.message?.content || "");
}

async function callGroq(imageBase64: string, mimeType: string, prompt: string) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: "llama-3.2-11b-vision-preview",
      messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } }] }],
      temperature: 0.7, max_tokens: 1000,
    }),
  });
  if (!res.ok) throw new Error(`Groq: ${res.status}`);
  const data = await res.json();
  return extractJson(data.choices?.[0]?.message?.content || "");
}

async function callAI(imageBase64: string, mimeType: string, prompt: string): Promise<Record<string, string>> {
  if (MISTRAL_API_KEY) {
    try { console.log("[ai] Trying Mistral..."); return await callMistral(imageBase64, mimeType, prompt); }
    catch (e) { console.warn("[ai] Mistral failed:", e); }
  }
  if (GEMINI_API_KEY) {
    try { console.log("[ai] Trying Gemini..."); return await callGemini(imageBase64, mimeType, prompt); }
    catch (e) { console.warn("[ai] Gemini failed:", e); }
  }
  if (GROQ_API_KEY) {
    try { console.log("[ai] Trying Groq..."); return await callGroq(imageBase64, mimeType, prompt); }
    catch (e) { console.warn("[ai] Groq failed:", e); }
  }
  throw new Error("Aucune clé IA configurée (MISTRAL_API_KEY, GEMINI_API_KEY ou GROQ_API_KEY)");
}

const PROMPT_PRODUCT = `Tu es un expert e-commerce pour Lousha Accessories (accessoires en raphia fait main au Togo).
Analyse cette image de produit. Réponds UNIQUEMENT ce JSON :
{"name":"Nom FR court","nameEn":"Product name EN","description":"Description FR 2-3 phrases","descriptionEn":"Description EN 2-3 sentences","slug":"slug-en-tirets","material":"Raphia 100% naturel","craftingTime":"2 jours"}`;

const PROMPT_PROMO = `Tu es un expert marketing pour Lousha Accessories (accessoires raphia Togo).
Analyse cette image pour une bannière promo. Réponds UNIQUEMENT ce JSON :
{"titleFr":"Titre FR élégant (max 6 mots)","titleEn":"Title EN elegant (max 6 words)","textFr":"Accroche FR (max 12 mots)","textEn":"Tagline EN (max 12 words)"}`;

export async function generateProductContent(imageBase64: string, mimeType: string) {
  return callAI(imageBase64, mimeType, PROMPT_PRODUCT);
}

export async function generatePromoContent(imageBase64: string, mimeType: string) {
  return callAI(imageBase64, mimeType, PROMPT_PROMO);
}
