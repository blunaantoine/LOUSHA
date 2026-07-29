import type { Metadata } from "next";
import { MaterialPageClient } from "./material-client";

const SITE_URL = "https://lousha-accessoire.com";

export const metadata: Metadata = {
  title: "Le Raphia — Fibre naturelle & artisanale | Lousha",
  description:
    "Le raphia est une fibre végétale naturelle récoltée sur le palmier raphia. Souple, résistante et lumineuse, elle se prête à un tressage d'une finesse remarquable. Découvrez la matière première de nos créations.",
  keywords: [
    "raphia", "rafia", "fibre naturelle", "raphia naturel", "palmier raphia",
    "tressage raphia", "fibre végétale", "matière naturelle", "raphia Togo",
    "raffia fiber", "natural raffia", "raffia palm",
  ],
  alternates: {
    canonical: `${SITE_URL}/material`,
    languages: {
      "fr-TG": `${SITE_URL}/material`,
      "fr": `${SITE_URL}/material`,
      "en": `${SITE_URL}/material?lang=en`,
      "x-default": `${SITE_URL}/material`,
    },
  },
  openGraph: {
    title: "Le Raphia — Fibre naturelle & artisanale | Lousha",
    description:
      "Découvrez le raphia, une fibre végétale noble et durable, récoltée de manière responsable au Togo.",
    url: `${SITE_URL}/material`,
    siteName: "Lousha — Raphia fait main au Togo",
    type: "website",
    locale: "fr_TG",
    images: [
      {
        url: "/images/hero/hero-1.png",
        width: 1200,
        height: 630,
        alt: "Le raphia — Fibre naturelle Lousha",
      },
    ],
  },
};

export default function MaterialPage() {
  return <MaterialPageClient />;
}
