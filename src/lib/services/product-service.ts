/**
 * Service Produits — logique d'accès aux données produits & catégories.
 *
 * Couche isolée du store et des composants : les hooks (use-catalog)
 * et les routes API consomment ce service. Si la source de données change
 * (ex: PostgreSQL au lieu de SQLite, ou API externe), seul ce fichier change.
 */
import { db } from "@/lib/db";

export interface ProductListOptions {
  category?: string;
  featured?: boolean;
  badge?: string;
}

export async function listCategories() {
  return db.category.findMany({
    orderBy: { order: "asc" },
    include: { products: { select: { id: true } } },
  });
}

export async function listProducts(opts: ProductListOptions = {}) {
  const where: Record<string, unknown> = {};
  if (opts.category && opts.category !== "all") {
    where.categorySlug = opts.category;
  }
  if (opts.featured) where.featured = true;
  if (opts.badge && opts.badge !== "all") where.badge = opts.badge;

  return db.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
}

export async function getProductWithRelated(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: {
        where: { active: true },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!product) return { product: null, related: [] };

  // Produits similaires : même catégorie, exclure le produit courant
  const related = await db.product.findMany({
    where: {
      categorySlug: product.categorySlug,
      NOT: { id: product.id },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return { product, related };
}
