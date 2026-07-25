import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/services/product-service";
import { listCategories } from "@/lib/services/product-service";

/**
 * Sitemap dynamique — https://lousha-accessoire.com/sitemap.xml
 *
 * Génère le sitemap pour Google Search Console.
 * Inclut la page d'accueil + les vues principales (shop, story, material, contact).
 *
 * Note : le site est une SPA (une seule route /), mais on peut quand même
 * lister les "vues" comme URLs avec des ancres pour aider Google à découvrir
 * le contenu. Les produits sont listés avec leur slug en paramètre.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://lousha-accessoire.com";
  const now = new Date();

  // Pages principales (vues de la SPA)
  const mainPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/?view=shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?view=story`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/?view=material`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/?view=contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/?view=faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Produits
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await listProducts();
    productEntries = products.map((p) => ({
      url: `${baseUrl}/?view=product&slug=${encodeURIComponent(p.slug)}`,
      lastModified: p.updatedAt || p.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (e) {
    console.error("Sitemap: failed to fetch products:", e);
  }

  // Catégories
  let categoryEntries: MetadataRoute.Sitemap = [];
  try {
    const categories = await listCategories();
    categoryEntries = categories.map((c) => ({
      url: `${baseUrl}/?view=shop&category=${encodeURIComponent(c.slug)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.error("Sitemap: failed to fetch categories:", e);
  }

  return [...mainPages, ...productEntries, ...categoryEntries];
}
