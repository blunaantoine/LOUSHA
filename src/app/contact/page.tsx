import type { Metadata } from "next";
import { ContactPageClient } from "./contact-client";

const SITE_URL = "https://lousha-accessoire.com";

export const metadata: Metadata = {
  title: "Contact — Lousha Accessoires | Raphia fait main au Togo",
  description:
    "Contactez Lousha Accessoires pour toute question, commande sur-mesure ou collaboration. Notre équipe vous répond avec plaisir. WhatsApp, e-mail, formulaire de contact.",
  keywords: [
    "contact lousha", "contacter lousha accessoires", "commande raphia",
    "raphia sur-mesure", "whatsapp lousha", "artisanat Togo contact",
    "lousha contact", "raffia contact", "handmade raffia contact",
  ],
  alternates: {
    canonical: `${SITE_URL}/contact`,
    languages: {
      "fr-TG": `${SITE_URL}/contact`,
      "fr": `${SITE_URL}/contact`,
      "en": `${SITE_URL}/contact?lang=en`,
      "x-default": `${SITE_URL}/contact`,
    },
  },
  openGraph: {
    title: "Contact — Lousha Accessoires",
    description:
      "Une question, une commande sur-mesure ? Contactez l'équipe Lousha Accessoires.",
    url: `${SITE_URL}/contact`,
    siteName: "Lousha — Raphia fait main au Togo",
    type: "website",
    locale: "fr_TG",
    images: [
      {
        url: "/images/hero/hero-1.png",
        width: 1200,
        height: 630,
        alt: "Contact Lousha Accessoires",
      },
    ],
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
