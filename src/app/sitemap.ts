import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const SITE_URL = "https://lousha-accessoire.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages statiques (toujours disponibles)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}?lang=en`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/shop?lang=en`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/story`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/story?lang=en`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/material`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/material?lang=en`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact?lang=en`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/faq?lang=en`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  // Essayer de récupérer les données dynamiques (produits & catégories)
  try {
    const [products, categories] = await Promise.all([
      db.product.findMany({
        where: { inStock: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      db.category.findMany({
        where: { active: true },
        select: { slug: true, updatedAt: true },
        orderBy: { order: "asc" },
      }),
    ]);

    // Pages catégories
    const categoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) => [
      {
        url: `${SITE_URL}/shop?category=${cat.slug}`,
        lastModified: cat.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/shop?category=${cat.slug}&lang=en`,
        lastModified: cat.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
    ]);

    // Pages produits — URLs propres /product/[slug]
    const productPages: MetadataRoute.Sitemap = products.flatMap((p) => [
      {
        url: `${SITE_URL}/product/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${SITE_URL}/product/${p.slug}?lang=en`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
    ]);

    return [...staticPages, ...categoryPages, ...productPages];
  } catch (error) {
    // Si la DB n'est pas disponible (build local), retourner uniquement les pages statiques
    console.warn("Sitemap: DB non disponible, retour des pages statiques uniquement");
    return staticPages;
  }
}
