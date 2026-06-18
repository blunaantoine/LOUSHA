"use client";

import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";

/**
 * Bandeau promotionnel avec effet "pop-out 3D".
 * - Grande carte horizontale aux coins fortement arrondis.
 * - Texte à gauche (accroches) + CTA à droite, zone centrale libre.
 * - Image du sac raphia (PNG transparent) centrée horizontalement,
 *   qui déborde franchement au-dessus de la bordure supérieure.
 * - IMPORTANT : pas de `overflow-hidden` sur la carte pour ne pas couper l'effet.
 * - Sur mobile : image réduite + texte replacé sous l'image.
 */
export function PromoBanner() {
  const { lang, setView } = useStore();
  const t = useDict(lang);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-24 sm:my-32 lg:my-36">
      {/* === Conteneur principal — PAS d'overflow:hidden === */}
      <div className="relative bg-accent text-accent-foreground rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] shadow-[0_30px_80px_-30px_rgba(49,27,0,0.5)]">
        {/* Décor de fond subtil (motif points) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* === Image pop-out 3D — PNG transparent, centrée, déborde au-dessus === */}
        {/* Positionnée en absolu, centrée horizontalement, remontée pour dépasser la bordure du haut */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-28 sm:-top-36 lg:-top-48 z-20 w-[240px] sm:w-[320px] lg:w-[420px]">
          <img
            src="/images/hero-bag-transparent.png"
            alt={lang === "fr" ? "Sac raphia Lousha" : "Lousha raffia bag"}
            className="w-full h-auto object-contain"
            style={{
              filter:
                "drop-shadow(0 30px 30px rgba(0,0,0,0.45)) drop-shadow(0 12px 12px rgba(0,0,0,0.3))",
            }}
            draggable={false}
          />
        </div>

        {/* === Contenu interne === */}
        <div className="relative grid lg:grid-cols-2 items-center gap-8 px-6 sm:px-10 lg:px-14 pt-44 sm:pt-56 lg:pt-64 pb-10 sm:pb-12 lg:pb-14">
          {/* --- Gauche : accroches --- */}
          <div className="text-center lg:text-left z-10">
            <p className="text-[10px] sm:text-xs tracking-luxe uppercase text-accent-foreground/70 mb-3 sm:mb-4">
              {t.promo.eyebrow}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.05] text-balance">
              {t.promo.title}
              <br />
              <span className="text-accent-foreground/85">
                {t.promo.titleAccent}
              </span>
            </h2>
          </div>

          {/* --- Droite : texte + CTA --- */}
          <div className="text-center lg:text-right z-10 lg:max-w-xs lg:ml-auto">
            <p className="text-sm sm:text-base text-accent-foreground/85 font-light leading-relaxed mb-6 lg:mb-8">
              {t.promo.text}
            </p>
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-3 justify-center lg:justify-end">
              <button
                onClick={() => setView("shop")}
                className="group inline-flex items-center justify-center gap-2 bg-background text-foreground px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-foreground hover:text-background transition-colors duration-300 w-full sm:w-auto"
              >
                {t.promo.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => setView("story")}
                className="inline-flex items-center justify-center gap-2 border border-accent-foreground/40 text-accent-foreground px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent-foreground/10 transition-colors duration-300 w-full sm:w-auto"
              >
                {t.promo.secondary}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
