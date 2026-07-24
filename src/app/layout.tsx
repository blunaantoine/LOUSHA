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

export const metadata: Metadata = {
  metadataBase: new URL("https://lousha-accessoire.com"),
  title: {
    default: "Lousha Accessories — Artisanat Raphia du Togo | Luxe Fait Main",
    template: "%s | Lousha Accessories",
  },
  description:
    "Lousha Accessories, marque Made in Togo. Sacs, chapeaux et objets de décoration en raphia 100% naturel, entièrement faits main. L'élégance artisanale africaine.",
  keywords: [
    "accessoires raphia",
    "made in Togo",
    "sacs artisanaux",
    "chapeau raphia",
    "décoration artisanale",
    "luxe africain",
    "fait main",
    "Lousha Accessories",
    "raphia Togo",
    "artisanat africain",
    "décoration raphia",
    "sac en raphia",
  ],
  authors: [{ name: "Lousha Accessories" }],
  creator: "Lousha Accessories",
  publisher: "Lousha Accessories",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: "/",
    languages: {
      fr: "/",
      en: "/",
    },
  },
  openGraph: {
    title: "Lousha Accessories — Artisanat Raphia du Togo",
    description:
      "Sacs, chapeaux et objets de décoration en raphia 100% naturel, entièrement faits main au Togo.",
    url: "https://lousha-accessoire.com",
    siteName: "Lousha Accessories",
    type: "website",
    locale: "fr_FR",
    images: [
      {
        url: "/images/hero-bag-transparent.png",
        width: 1200,
        height: 630,
        alt: "Lousha Accessories — Artisanat Raphia du Togo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lousha Accessories — Artisanat Raphia du Togo",
    description:
      "Sacs, chapeaux et objets de décoration en raphia 100% naturel, faits main au Togo.",
    images: ["/images/hero-bag-transparent.png"],
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
  // Données structurées JSON-LD pour Google (Organization + WebSite)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://lousha-accessoire.com/#organization",
        name: "Lousha Accessories",
        url: "https://lousha-accessoire.com",
        description:
          "Marque Made in Togo. Sacs, chapeaux et objets de décoration en raphia 100% naturel, entièrement faits main.",
        address: {
          "@type": "PostalAddress",
          addressCountry: "TG",
          addressRegion: "Togo",
        },
        sameAs: [
          "https://www.instagram.com/",
          "https://www.facebook.com/",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://lousha-accessoire.com/#website",
        url: "https://lousha-accessoire.com",
        name: "Lousha Accessories",
        publisher: { "@id": "https://lousha-accessoire.com/#organization" },
        inLanguage: ["fr", "en"],
        potentialAction: {
          "@type": "SearchAction",
          target:
            "https://lousha-accessoire.com/?view=shop&q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Store",
        "@id": "https://lousha-accessoire.com/#store",
        name: "Lousha Accessories",
        url: "https://lousha-accessoire.com",
        description:
          "Boutique en ligne d'accessoires et décoration en raphia fait main au Togo.",
        parentOrganization: {
          "@id": "https://lousha-accessoire.com/#organization",
        },
        address: {
          "@type": "PostalAddress",
          addressCountry: "TG",
        },
      },
    ],
  };

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
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
