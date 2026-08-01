import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware de redirection SEO :
 * - Redirige les anciennes URLs SPA (/?view=shop, /?view=product&slug=x) vers les nouvelles routes
 * - Maintient la compatibilité avec les liens existants et les favoris
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Ne pas rediriger les routes API, les assets statiques, etc.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.includes(".") // fichiers statiques (favicon.ico, etc.)
  ) {
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
  // Appliquer le middleware sur toutes les routes sauf les assets statiques
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|fonts).*)"],
};
