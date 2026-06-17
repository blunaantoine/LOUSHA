"use client";

import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";

/**
 * Bandeau promotionnel avec effet "pop-out 3D".
 * - Grande carte horizontale aux coins fortement arrondis.
 * - Texte à gauche (accroches) + CTA à droite, zone centrale libre.
 * - Image du sac raphia qui dépasse de la bordure supérieure (effet relief).
 * - IMPORTANT : pas de `overflow-hidden` sur la carte pour ne pas couper l'effet.
 * - Sur mobile : image réduite + texte replacé sous l'image.
 */
export function PromoBanner() {
  const { lang, setView } = useStore();
  const t = useDict(lang);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-20 sm:my-28">
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

        {/* === Contenu interne === */}
        <div className="relative grid lg:grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16 min-h-[280px] sm:min-h-[320px]">
          {/* --- Gauche : accroches --- */}
          <div className="text-center lg:text-left z-10 lg:pr-4">
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

          {/* --- Centre : image pop-out 3D --- */}
          {/* Conteneur absolu qui dépasse de la bordure supérieure */}
          <div className="relative z-20 flex items-center justify-center order-last lg:order-none lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:-top-16 lg:scale-110">
            <img
              src="/images/hero-bag.png"
              alt={lang === "fr" ? "Sac raphia Lousha" : "Lousha raffia bag"}
              className="h-44 sm:h-56 lg:h-72 w-auto object-contain mix-blend-multiply"
              style={{
                filter:
                  "drop-shadow(0 25px 35px rgba(0,0,0,0.45)) drop-shadow(0 8px 12px rgba(0,0,0,0.25))",
              }}
              draggable={false}
            />
          </div>

          {/* --- Droite : texte + CTA --- */}
          <div className="text-center lg:text-right z-10 lg:pl-4 lg:max-w-xs lg:ml-auto">
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
