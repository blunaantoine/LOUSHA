import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";

const oswald = Oswald({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Good Times chargée via next/font/local → préchargement automatique,
// plus de flash de police (FOUT) au chargement.
const goodTimes = localFont({
  src: "../fonts/Good-Times.woff",
  variable: "--font-display",
  display: "swap",
  preload: true,
  fallback: ["var(--font-sans)"],
});

const SITE_URL = "https://lousha-accessoire.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lousha — Raphia fait main au Togo | Sacs, Chapeaux & Décoration artisanale",
    template: "%s | Lousha — Raphia fait main",
  },
  description:
    "Lousha : sacs, chapeaux, paniers et objets de décoration en raphia 100% naturel, entièrement faits main au Togo. L'élégance de l'artisanat africain — raphia tressé par nos artisans.",
  keywords: [
    // === Mots-clés principaux (haute priorité) ===
    "raphia", "lousha", "raphia fait main", "lousha accessoires",
    "sac raphia", "chapeau raphia", "panier raphia", "décoration raphia",
    // === Variations orthographiques ===
    "rafia", "rafia fait main", "sac rafia", "chapeau rafia",
    // === Marque ===
    "lousha-accessoire", "lousha-accessoire.com", "lousha accessories",
    "Lousha Accessoires", "LOUSHA",
    // === Produits ===
    "sac en raphia", "sac artisanaux", "chapeau en raphia", "panier artisanal",
    "accessoires raphia", "décoration artisanale", "objets décoration raphia",
    "sac main raphia", "sac tressé raphia", "chapeau tressé",
    // === Localisation & origine ===
    "made in Togo", "artisanat togolais", "artisanat africain",
    "fait main Togo", "raphia Togo", "rafia Togo",
    "artisanat Afrique de l'Ouest", "décoration africaine",
    // === Style & qualité ===
    "luxe africain", "fait main", "artisanat éthique",
    "raphia naturel", "tressage raphia", "raphia 100% naturel",
    // === English keywords ===
    "handmade raffia", "raffia bag", "raffia hat", "raffia basket",
    "African craft", "Togo handmade", "raffia home decor",
    "lousha raphia", "lousha raffia",
  ],
  authors: [{ name: "Lousha Accessoires", url: SITE_URL }],
  creator: "Lousha Accessoires",
  publisher: "Lousha Accessoires",
  category: "shopping",
  classification: "E-commerce artisanal raphia",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "fr-TG": SITE_URL,
      "fr": SITE_URL,
      "en": `${SITE_URL}?lang=en`,
      "x-default": SITE_URL,
    },
  },
  openGraph: {
    title: "Lousha — Raphia fait main au Togo | Sacs, Chapeaux & Décoration",
    description:
      "Découvrez les créations Lousha : sacs, chapeaux, paniers et objets de décoration en raphia 100% naturel, tressés à la main par nos artisans au Togo.",
    url: SITE_URL,
    siteName: "Lousha — Raphia fait main au Togo",
    type: "website",
    locale: "fr_TG",
    alternateLocale: ["en_US", "fr_FR"],
    images: [
      {
        url: "/images/hero/hero-1.png",
        width: 1200,
        height: 630,
        alt: "Lousha — Créations en raphia fait main au Togo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lousha — Raphia fait main au Togo",
    description:
      "Sacs, chapeaux, paniers et objets de décoration en raphia 100% naturel, faits main au Togo.",
    images: ["/images/hero/hero-1.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Données structurées JSON-LD pour Google (Organization + WebSite + Store + Product)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://lousha-accessoire.com/#organization",
        name: "Lousha Accessoires",
        alternateName: ["Lousha", "Lousha Accessories", "LOUSHA"],
        url: "https://lousha-accessoire.com",
        logo: "https://lousha-accessoire.com/logo.svg",
        description:
          "Lousha Accessoires — Marque Made in Togo. Sacs, chapeaux, paniers et objets de décoration en raphia 100% naturel, entièrement faits main par des artisans togolais.",
        address: {
          "@type": "PostalAddress",
          addressCountry: "TG",
          addressRegion: "Togo",
          addressLocality: "Lomé",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+228-96-69-29-72",
          contactType: "customer service",
          availableLanguage: ["fr", "en"],
        },
        email: "bonjour@lousha-accessories.com",
        sameAs: [
          "https://www.instagram.com/lousha_accessoires",
          "https://www.facebook.com/loushaaccessoires",
        ],
        foundingLocation: {
          "@type": "Place",
          name: "Togo",
        },
        knowsAbout: [
          "raphia",
          "artisanat togolais",
          "décoration artisanale",
          "sacs en raphia",
          "chapeaux en raphia",
          "paniers en raphia",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://lousha-accessoire.com/#website",
        url: "https://lousha-accessoire.com",
        name: "Lousha — Raphia fait main au Togo",
        alternateName: "Lousha Accessoires",
        publisher: { "@id": "https://lousha-accessoire.com/#organization" },
        inLanguage: ["fr", "en"],
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              "https://lousha-accessoire.com/?view=shop&q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Store",
        "@id": "https://lousha-accessoire.com/#store",
        name: "Lousha Accessoires — Boutique en ligne",
        url: "https://lousha-accessoire.com/?view=shop",
        description:
          "Boutique en ligne de sacs, chapeaux, paniers et objets de décoration en raphia fait main au Togo. Raphia 100% naturel, tressé par nos artisans.",
        parentOrganization: {
          "@id": "https://lousha-accessoire.com/#organization",
        },
        address: {
          "@type": "PostalAddress",
          addressCountry: "TG",
          addressLocality: "Lomé",
        },
        priceRange: "₣₣",
        openingHours: "Mo-Sa 09:00-19:00",
        currenciesAccepted: "XOF",
        paymentAccepted: "Cash, Mobile Money",
      },
      {
        "@type": "Product",
        "@id": "https://lousha-accessoire.com/#product-category-raphia",
        name: "Créations en raphia Lousha",
        description:
          "Sacs, chapeaux, paniers et objets de décoration en raphia 100% naturel, faits main au Togo par les artisans Lousha.",
        brand: {
          "@type": "Brand",
          name: "Lousha",
          alternateName: "Lousha Accessoires",
        },
        material: "Raphia naturel",
        origin: "Togo",
        category: "Décoration artisanale",
        manufacturer: { "@id": "https://lousha-accessoire.com/#organization" },
      },
    ],
  };

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://lousha-accessoire.com" />
        <link rel="alternate" hrefLang="fr" href="https://lousha-accessoire.com" />
        <link rel="alternate" hrefLang="en" href="https://lousha-accessoire.com/?lang=en" />
        <link rel="alternate" hrefLang="x-default" href="https://lousha-accessoire.com" />
        <meta name="geo.region" content="TG" />
        <meta name="geo.placename" content="Lomé, Togo" />
        <meta name="theme-color" content="#311b00" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${oswald.variable} ${goodTimes.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: "var(--foreground)",
              color: "var(--background)",
              border: "none",
              borderRadius: "0",
              fontFamily: "var(--font-sans)",
              letterSpacing: "0.02em",
            },
          }}
        />
      </body>
    </html>
  );
}
