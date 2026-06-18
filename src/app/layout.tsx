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
  title: "Lousha Accessories — Artisanat Raphia du Togo | Luxe Fait Main",
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
  ],
  authors: [{ name: "Lousha Accessories" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Lousha Accessories — Artisanat Raphia du Togo",
    description:
      "Sacs, chapeaux et objets de décoration en raphia 100% naturel, entièrement faits main au Togo.",
    siteName: "Lousha Accessories",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lousha Accessories — Artisanat Raphia du Togo",
    description:
      "Sacs, chapeaux et objets de décoration en raphia 100% naturel, faits main au Togo.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
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
