"use client";

import { useEffect, useState } from "react";

export interface SiteContent {
  content: Record<string, { valueFr: string; valueEn: string }>;
  images: Record<string, string>;
}

const EMPTY: SiteContent = { content: {}, images: {} };

/**
 * Charge tous les textes + images éditables de la page d'accueil.
 * Recharge à chaque montage (quand on revient sur la home).
 */
export function useSiteContent() {
  const [state, setState] = useState<{ data: SiteContent; loaded: boolean }>({
    data: EMPTY,
    loaded: false,
  });

  useEffect(() => {
    let active = true;
    // Cache: no-store pour toujours récupérer les dernières données
    fetch("/api/site-content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : EMPTY))
      .then((d) => {
        if (active)
          setState({
            data: { content: d.content || {}, images: d.images || {} },
            loaded: true,
          });
      })
      .catch(() => active && setState({ data: EMPTY, loaded: true }));
    return () => {
      active = false;
    };
  }, []);

  return state;
}

/** Récupère un texte dans la bonne langue (avec fallback). */
export function getContent(
  data: SiteContent,
  key: string,
  fallback: string,
  lang: "fr" | "en"
): string {
  const entry = data.content[key];
  if (!entry) return fallback;
  return lang === "fr" ? entry.valueFr || fallback : entry.valueEn || fallback;
}

/** Récupère une image (avec fallback). */
export function getImage(
  data: SiteContent,
  key: string,
  fallback: string
): string {
  return data.images[key] || fallback;
}
