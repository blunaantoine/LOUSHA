import type { Metadata } from "next";
import { FAQPageClient } from "./faq-client";

const SITE_URL = "https://lousha-accessoire.com";

export const metadata: Metadata = {
  title: "FAQ — Questions fréquentes | Lousha Accessoires",
  description:
    "Retrouvez les réponses à vos questions sur les créations Lousha : livraison, retours, entretien du raphia, commandes sur-mesure, paiements acceptés.",
  keywords: [
    "FAQ lousha", "questions raphia", "livraison raphia", "retour raphia",
    "entretien raphia", "commande raphia", "paiement lousha",
    "raphia FAQ", "raffia FAQ",
  ],
  alternates: {
    canonical: `${SITE_URL}/faq`,
    languages: {
      "fr-TG": `${SITE_URL}/faq`,
      "fr": `${SITE_URL}/faq`,
      "en": `${SITE_URL}/faq?lang=en`,
      "x-default": `${SITE_URL}/faq`,
    },
  },
  openGraph: {
    title: "FAQ — Questions fréquentes | Lousha Accessoires",
    description:
      "Retrouvez les réponses à vos questions sur les créations Lousha en raphia fait main.",
    url: `${SITE_URL}/faq`,
    siteName: "Lousha — Raphia fait main au Togo",
    type: "website",
    locale: "fr_TG",
  },
};

export default function FAQPage() {
  return <FAQPageClient />;
}
