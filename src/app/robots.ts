import type { MetadataRoute } from "next";

/**
 * robots.txt dynamique — https://lousha-accessoire.com/robots.txt
 *
 * Autorise tous les crawlers et pointe vers le sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/admin/", "/api/auth/", "/api/uploads/"],
    },
    sitemap: "https://lousha-accessoire.com/sitemap.xml",
    host: "https://lousha-accessoire.com",
  };
}
