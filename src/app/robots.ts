import type { MetadataRoute } from "next";

/**
 * robots.txt dynamique — https://lousha-accessoire.com/robots.txt
 *
 * Autorise tous les crawlers et pointe vers le sitemap.
 * Bloque les routes admin/api sensibles pour ne pas gaspiller le budget crawl.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/?view=shop", "/?view=story", "/?view=material", "/?view=contact", "/?view=faq", "/?view=product"],
        disallow: ["/api/admin/", "/api/auth/", "/api/uploads/", "/?view=admin", "/?view=account", "/?view=auth", "/?view=forgot", "/?view=reset"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/admin/", "/api/auth/"],
      },
    ],
    sitemap: "https://lousha-accessoire.com/sitemap.xml",
    host: "https://lousha-accessoire.com",
  };
}
