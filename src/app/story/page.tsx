import type { Metadata } from "next";
import { StoryPageClient } from "./story-client";

const SITE_URL = "https://lousha-accessoire.com";

export const metadata: Metadata = {
  title: "Notre Histoire — Raphia fait main au Togo | Lousha",
  description:
    "Découvrez l'histoire de Lousha : née au Togo, notre marque célèbre le savoir-faire artisanal du raphia. Des mains expertes transforment la fibre naturelle en pièces uniques de décoration.",
  keywords: [
    "histoire lousha", "raphia togolais", "artisanat Togo", "savoir-faire raphia",
    "tressage raphia", "fait main Togo", "artisanat africain", "lousha histoire",
    "rafia Togo", "handmade raffia Togo story",
  ],
  alternates: {
    canonical: `${SITE_URL}/story`,
    languages: {
      "fr-TG": `${SITE_URL}/story`,
      "fr": `${SITE_URL}/story`,
      "en": `${SITE_URL}/story?lang=en`,
      "x-default": `${SITE_URL}/story`,
    },
  },
  openGraph: {
    title: "Notre Histoire — Lousha, raphia fait main au Togo",
    description:
      "Lousha est née d'une conviction : le savoir-faire artisanal togolais mérite une place de choix dans l'univers de la décoration.",
    url: `${SITE_URL}/story`,
    siteName: "Lousha — Raphia fait main au Togo",
    type: "website",
    locale: "fr_TG",
    images: [
      {
        url: "/images/hero/hero-1.png",
        width: 1200,
        height: 630,
        alt: "L'histoire Lousha — Raphia fait main au Togo",
      },
    ],
  },
};

export default function StoryPage() {
  return <StoryPageClient />;
}
