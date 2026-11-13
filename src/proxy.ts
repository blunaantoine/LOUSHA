import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";

/**
 * Proxy (anciennement middleware) — s'exécute avant chaque requête.
 *
 * 1. Mode maintenance : quand il est activé depuis l'administration, les
 *    visiteurs voient une page « site en maintenance » (code HTTP 503) et ne
 *    peuvent plus rien envoyer (commandes, inscriptions, messages). Les
 *    comptes ADMIN et MANAGER continuent d'utiliser le site normalement.
 * 2. Redirections SEO des anciennes URLs (/?view=shop, /?view=product&slug=x).
 */

/* ============ Maintenance ============ */

// Lecture du réglage mise en cache quelques secondes pour ne pas interroger
// la base à chaque requête. Un changement prend effet en 3 secondes au plus.
const CACHE_MS = 3000;
let cache: { value: boolean; at: number } | null = null;

async function maintenanceOn(): Promise<boolean> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.value;
  try {
    const row = await db.siteSetting.findUnique({ where: { key: "maintenanceEnabled" } });
    cache = { value: row?.value === "true", at: Date.now() };
  } catch (error) {
    console.error("[proxy] lecture du mode maintenance impossible :", error);
    // En cas d'erreur, on garde la dernière valeur connue (ou site ouvert).
    cache = { value: cache?.value ?? false, at: Date.now() };
  }
  return cache.value;
}

/** ADMIN ou MANAGER connecté, non bloqué (vérifié en base). */
async function isStaff(request: NextRequest): Promise<boolean> {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName:
        process.env.NODE_ENV === "production"
          ? "__Host-next-auth.session-token"
          : "next-auth.session-token",
    });
    const id = (token as { id?: string } | null)?.id;
    if (!id) return false;
    const user = await db.user.findUnique({
      where: { id },
      select: { role: true, blocked: true },
    });
    return !!user && !user.blocked && (user.role === "ADMIN" || user.role === "MANAGER");
  } catch {
    return false;
  }
}

const READ_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/** Retourne une réponse de blocage, ou null si la requête peut passer. */
async function maintenanceGate(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  // Toujours accessibles : connexion (pour que les admins puissent entrer),
  // réglages publics. L'inscription reste fermée.
  if (pathname.startsWith("/auth/")) return null;
  if (pathname === "/api/settings") return null;
  if (pathname.startsWith("/api/auth/") && pathname !== "/api/auth/register") return null;

  // Lectures de l'API : sans danger (les routes admin vérifient déjà le rôle).
  if (pathname.startsWith("/api/") && READ_METHODS.has(method)) return null;

  if (await isStaff(request)) return null;

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Le site est en maintenance. Réessayez plus tard.", code: "MAINTENANCE" },
      { status: 503, headers: { "Retry-After": "3600", "Cache-Control": "no-store" } }
    );
  }
  return new NextResponse(MAINTENANCE_HTML, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": "3600",
      "Cache-Control": "no-store",
    },
  });
}

/* ============ Proxy ============ */

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Fichiers statiques : jamais bloqués (logo, polices, images, robots.txt…)
  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    pathname.includes(".");

  if (!isStatic && (await maintenanceOn())) {
    const blocked = await maintenanceGate(request);
    if (blocked) return blocked;
  }

  // Ne pas rediriger les routes API, les assets statiques, etc.
  if (pathname.startsWith("/api") || isStatic) {
    return NextResponse.next();
  }

  const view = searchParams.get("view");
  if (!view) return NextResponse.next();

  // Mapping des anciennes URLs vers les nouvelles routes
  const viewMap: Record<string, string> = {
    shop: "/shop",
    story: "/story",
    material: "/material",
    contact: "/contact",
    faq: "/faq",
    help: "/faq",
  };

  // Cas spécial : page produit avec slug
  if (view === "product") {
    const slug = searchParams.get("slug");
    if (slug) {
      const url = request.nextUrl.clone();
      url.pathname = `/product/${slug}`;
      url.searchParams.delete("view");
      url.searchParams.delete("slug");
      return NextResponse.redirect(url, 301); // 301 = redirection permanente (SEO)
    }
  }

  // Redirection des autres vues
  const newPath = viewMap[view];
  if (newPath) {
    const url = request.nextUrl.clone();
    url.pathname = newPath;
    url.searchParams.delete("view");
    return NextResponse.redirect(url, 301);
  }

  // Vues qui restent en SPA (auth, account, admin, forgot, reset) — pas de redirection
  return NextResponse.next();
}

export const config = {
  // Toutes les routes sauf les assets statiques
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|fonts).*)"],
};

/* ============ Page de maintenance ============ */

const MAINTENANCE_HTML = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Lousha Accessoires — Maintenance en cours</title>
<link rel="icon" href="/favicon.ico">
<style>
  @font-face { font-family: "Good Times"; src: url("/fonts/Good-Times.ttf.woff") format("woff"); font-display: swap; }
  :root { --fg: #111111; --muted: #5A5A5A; --accent: #311B00; --line: #E5E5E8; --bg: #FFFFFF; }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; }
  body { background: var(--bg); color: var(--fg); font-family: "Helvetica Neue", Arial, sans-serif;
         display: flex; align-items: center; justify-content: center; padding: 24px 16px; }
  main { max-width: 560px; width: 100%; text-align: center; }
  img.logo { height: 56px; width: auto; margin-bottom: 40px; }
  .eyebrow { font-size: 11px; letter-spacing: .22em; text-transform: uppercase; color: var(--accent); margin: 0 0 14px; }
  h1 { font-family: "Good Times", "Helvetica Neue", Arial, sans-serif; font-weight: 400; font-size: clamp(28px, 7vw, 44px);
       line-height: 1.1; letter-spacing: .02em; text-transform: uppercase; margin: 0 0 20px; }
  p.text { color: var(--muted); font-size: 16px; line-height: 1.6; margin: 0 auto 8px; max-width: 460px; }
  p.en { font-size: 14px; margin-top: 18px; }
  .actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 32px; }
  .btn { display: inline-flex; align-items: center; justify-content: center; padding: 13px 26px; border-radius: 999px;
         font-size: 12px; letter-spacing: .12em; text-transform: uppercase; text-decoration: none; }
  .btn-wa { background: #25D366; color: #fff; }
  .btn-mail { border: 1px solid var(--fg); color: var(--fg); }
  hr { border: none; border-top: 1px solid var(--line); margin: 48px 0 20px; }
  .foot { font-size: 12px; color: var(--muted); }
  .foot a { color: var(--muted); }
</style>
</head>
<body>
<main>
  <img class="logo" src="/images/lousha-logo.png" alt="Lousha Accessoires">
  <p class="eyebrow">Maintenance en cours</p>
  <h1>Nous revenons très vite</h1>
  <p class="text">Notre boutique est momentanément fermée pour une mise à jour. Merci de votre patience, nous serons de retour dans quelques instants.</p>
  <p class="text en">Our shop is temporarily closed for maintenance. Thank you for your patience — we'll be back shortly.</p>
  <div class="actions">
    <a class="btn btn-wa" href="https://wa.me/22896692972" target="_blank" rel="noopener">WhatsApp</a>
    <a class="btn btn-mail" href="mailto:contact@lousha-accessoire.com">contact@lousha-accessoire.com</a>
  </div>
  <hr>
  <p class="foot">Lousha Accessoires — Made in Togo · Raphia fait main · <a href="/auth/login">Espace administrateur</a></p>
</main>
</body>
</html>`;
