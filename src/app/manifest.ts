import type { MetadataRoute } from "next";

/**
 * Manifest PWA — https://lousha-accessoire.com/manifest.webmanifest
 *
 * Permet l'installation de l'app sur mobile et améliore l'expérience.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lousha — Raphia fait main au Togo | Sacs, Chapeaux & Décoration",
    short_name: "Lousha",
    description:
      "Sacs, chapeaux, paniers et objets de décoration en raphia 100% naturel, faits main au Togo par les artisans Lousha.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#311b00",
    lang: "fr",
    categories: ["shopping", "lifestyle", "home"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
