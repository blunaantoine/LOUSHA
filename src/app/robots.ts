import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/shop", "/story", "/material", "/contact", "/faq", "/product/"],
        disallow: ["/api/", "/auth/", "/account", "/admin", "/checkout/"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/shop", "/story", "/material", "/contact", "/faq", "/product/"],
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://lousha-accessoire.com/sitemap.xml",
  };
}
