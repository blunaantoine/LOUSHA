import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductWithRelated } from "@/lib/services/product-service";
import { ProductPageClient } from "./product-client";

const SITE_URL = "https://lousha-accessoire.com";

interface Props {
  params: Promise<{ slug: string }>;
}

/** Génère les métadonnées dynamiques pour chaque produit (SEO) */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const { product } = await getProductWithRelated(slug);
    if (!product) return { title: "Produit introuvable | Lousha" };

    const name = product.name;
    const nameEn = product.nameEn;
    const description = product.description;
    const descriptionEn = product.descriptionEn;
    const price = (product.priceCents / 100).toLocaleString("fr-FR");
    const image = product.image.startsWith("http")
      ? product.image
      : `${SITE_URL}${product.image}`;

    return {
      title: `${name} — Raphia fait main au Togo | Lousha`,
      description: `${description} Prix : ${price} FCFA. Fait main au Togo par les artisans Lousha.`,
      keywords: [
        name.toLowerCase(),
        nameEn.toLowerCase(),
        "raphia", "raphia fait main", "sac raphia", "chapeau raphia",
        "panier raphia", "décoration raphia", product.material.toLowerCase(),
        "lousha", "fait main Togo", "artisanat togolais",
        "rafia", "handmade raffia",
      ],
      alternates: {
        canonical: `${SITE_URL}/product/${slug}`,
        languages: {
          "fr-TG": `${SITE_URL}/product/${slug}`,
          "fr": `${SITE_URL}/product/${slug}`,
          "en": `${SITE_URL}/product/${slug}?lang=en`,
          "x-default": `${SITE_URL}/product/${slug}`,
        },
      },
      openGraph: {
        title: `${name} — Lousha`,
        description: description,
        url: `${SITE_URL}/product/${slug}`,
        siteName: "Lousha — Raphia fait main au Togo",
        type: "website",
        locale: "fr_TG",
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: `${name} — Lousha Accessoires`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} — Lousha`,
        description: description,
        images: [image],
      },
    };
  } catch {
    return {
      title: "Produit | Lousha",
      description: "Création en raphia fait main au Togo par Lousha Accessoires.",
    };
  }
}

export default async function ProductPageRoute({ params }: Props) {
  const { slug } = await params;

  let product: Awaited<ReturnType<typeof getProductWithRelated>>["product"] = null;
  let related: Awaited<ReturnType<typeof getProductWithRelated>>["related"] = [];

  try {
    const data = await getProductWithRelated(slug);
    product = data.product;
    related = data.related;
  } catch {
    notFound();
  }

  if (!product) {
    notFound();
  }

  // JSON-LD structuré pour le produit (Google Rich Results)
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image.startsWith("http")
      ? product.image
      : `${SITE_URL}${product.image}`,
    url: `${SITE_URL}/product/${slug}`,
    sku: product.slug,
    brand: {
      "@type": "Brand",
      name: "Lousha",
      alternateName: "Lousha Accessoires",
    },
    material: product.material,
    origin: product.origin,
    category: product.category?.name ?? "Décoration artisanale",
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${slug}`,
      priceCurrency: "XOF",
      price: product.priceCents / 100,
      priceValidUntil: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Lousha Accessoires",
      },
    },
    // Breadcrumb
    ...(product.category && {
      isRelatedTo: {
        "@type": "Thing",
        name: product.category.name,
      },
    }),
  };

  // JSON-LD BreadcrumbList
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Boutique",
        item: `${SITE_URL}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category?.name ?? "Collection",
        item: `${SITE_URL}/shop?category=${product.categorySlug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: `${SITE_URL}/product/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductPageClient product={product} related={related} />
    </>
  );
}
