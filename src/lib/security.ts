/**
 * Utilitaires de sécurité partagés par les routes API :
 * validation des entrées, échappement HTML. (Limitation de débit : rate-limit.ts)
 */

/** Longueur minimale des mots de passe (création et changement). */
export const MIN_PASSWORD_LENGTH = 8;
export const PASSWORD_TOO_SHORT = `Le mot de passe doit faire au moins ${MIN_PASSWORD_LENGTH} caractères.`;

type HeaderSource =
  | { get(name: string): string | null }
  | Record<string, string | string[] | undefined>
  | undefined
  | null;

/** Adresse IP du client (derrière Nginx : X-Real-IP / X-Forwarded-For). */
export function clientIp(headers: HeaderSource): string {
  if (!headers) return "unknown";
  const read = (name: string): string | null => {
    if (typeof (headers as { get?: unknown }).get === "function") {
      return (headers as { get(n: string): string | null }).get(name);
    }
    const v = (headers as Record<string, string | string[] | undefined>)[name];
    return Array.isArray(v) ? v[0] ?? null : v ?? null;
  };
  const real = read("x-real-ip");
  if (real) return real.trim();
  const fwd = read("x-forwarded-for");
  if (fwd) {
    // Nginx ajoute l'IP réelle en dernier ($proxy_add_x_forwarded_for)
    const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return "unknown";
}

const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/;

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && EMAIL_RE.test(value);
}

/** Chaîne non vide, bornée en longueur. */
export function isText(value: unknown, max: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

/** Échappe une chaîne avant insertion dans du HTML (emails). */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Sérialise du JSON-LD sans risque de fermeture de balise <script>. */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const TOO_MANY = "Trop de tentatives. Réessayez dans quelques minutes.";
