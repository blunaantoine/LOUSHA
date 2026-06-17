import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const oswald = Oswald({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
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
        className={`${oswald.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
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
