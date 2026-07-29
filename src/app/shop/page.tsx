import type { Metadata } from "next";
import { ShopPageClient } from "./shop-client";

const SITE_URL = "https://lousha-accessoire.com";

export const metadata: Metadata = {
  title: "Boutique — Sacs, Chapeaux & Paniers en Raphia fait main | Lousha",
  description:
    "Découvrez toutes les créations Lousha : sacs, chapeaux, paniers et objets de décoration en raphia 100% naturel, entièrement faits main au Togo. Livraison disponible.",
  keywords: [
    "boutique raphia", "sac raphia", "chapeau raphia", "panier raphia",
    "décoration raphia", "raphia fait main", "achat raphia Togo",
    "sac en raphia", "chapeau en raphia", "panier artisanal",
    "lousha boutique", "rafia boutique", "handmade raffia shop",
  ],
  alternates: {
    canonical: `${SITE_URL}/shop`,
    languages: {
      "fr-TG": `${SITE_URL}/shop`,
      "fr": `${SITE_URL}/shop`,
      "en": `${SITE_URL}/shop?lang=en`,
      "x-default": `${SITE_URL}/shop`,
    },
  },
  openGraph: {
    title: "Boutique Lousha — Sacs, Chapeaux & Paniers en Raphia fait main",
    description:
      "Toutes les créations Lousha : sacs, chapeaux, paniers et objets de décoration en raphia 100% naturel, faits main au Togo.",
    url: `${SITE_URL}/shop`,
    siteName: "Lousha — Raphia fait main au Togo",
    type: "website",
    locale: "fr_TG",
    images: [
      {
        url: "/images/hero/hero-1.png",
        width: 1200,
        height: 630,
        alt: "Boutique Lousha — Créations en raphia fait main",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Boutique Lousha — Raphia fait main",
    description:
      "Sacs, chapeaux, paniers et objets de décoration en raphia 100% naturel, faits main au Togo.",
    images: ["/images/hero/hero-1.png"],
  },
};

export default function ShopPage() {
  return <ShopPageClient />;
}
