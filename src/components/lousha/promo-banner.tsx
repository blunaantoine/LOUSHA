"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { useSiteContent, getContent, getImage } from "@/hooks/use-site-content";
import { ArrowRight } from "lucide-react";

/**
 * Bandeau promo — carousel avec multiple images.
 * Image pop-out 3D (taille doublée), texte à gauche, CTA à droite.
 * Les images défilent automatiquement (promo-1, promo-2, etc.).
 */
export function PromoBanner() {
  const { lang, setView } = useStore();
  const t = useDict(lang);
  const { data } = useSiteContent();
  const [activeSlide, setActiveSlide] = useState(0);

  // Récupère toutes les images promo (promo, promo-1, promo-2, etc.)
  const promoImages = [
    getImage(data, "promo", "/images/hero-bag-transparent.png"),
    getImage(data, "promo-1", "/images/hero-bag-transparent.png"),
    getImage(data, "promo-2", "/images/hero-bag-transparent.png"),
  ].filter((url, idx, arr) => arr.indexOf(url) === idx); // unique

  // Carousel auto
  useEffect(() => {
    if (promoImages.length <= 1) return;
    const id = setInterval(() => {
      setActiveSlide((i) => (i + 1) % promoImages.length);
    }, 5000);
    return () => clearInterval(id);
  }, [promoImages.length]);

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

        {/* === Image pop-out 3D — 2/3 de la taille doublée === */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-28 sm:-top-36 lg:-top-48 z-20 w-[320px] sm:w-[427px] lg:w-[560px] flex justify-center">
          {promoImages.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={lang === "fr" ? "Sac raphia Lousha" : "Lousha raffia bag"}
              className={`w-full h-auto object-contain transition-opacity duration-[1400ms] ease-out ${
                i === activeSlide ? "opacity-100 relative" : "opacity-0 absolute"
              }`}
              style={{
                filter:
                  "drop-shadow(0 30px 30px rgba(0,0,0,0.45)) drop-shadow(0 12px 12px rgba(0,0,0,0.3))",
              }}
              draggable={false}
            />
          ))}
        </div>

        {/* Indicateurs carousel */}
        {promoImages.length > 1 && (
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
            {promoImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className="h-px transition-all duration-500"
                style={{
                  width: i === activeSlide ? "32px" : "16px",
                  backgroundColor: i === activeSlide ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </div>
        )}

        {/* === Contenu interne === */}
        <div className="relative grid lg:grid-cols-2 items-center gap-8 px-6 sm:px-10 lg:px-14 pt-44 sm:pt-56 lg:pt-64 pb-10 sm:pb-12 lg:pb-14">
          {/* --- Gauche : accroches --- */}
          <div className="text-center lg:text-left z-10">
            <p className="text-[10px] sm:text-xs tracking-luxe uppercase text-accent-foreground/70 mb-3 sm:mb-4">
              {getContent(data, "promo.eyebrow", t.promo.eyebrow, lang)}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.05] text-balance">
              {getContent(data, "promo.title", t.promo.title, lang)}
              <br />
              <span className="text-accent-foreground/85">
                {getContent(data, "promo.titleAccent", t.promo.titleAccent, lang)}
              </span>
            </h2>
          </div>

          {/* --- Droite : texte + CTA --- */}
          <div className="text-center lg:text-right z-10 lg:max-w-xs lg:ml-auto">
            <p className="text-sm sm:text-base text-accent-foreground/85 font-light leading-relaxed mb-6 lg:mb-8">
              {getContent(data, "promo.text", t.promo.text, lang)}
            </p>
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-3 justify-center lg:justify-end">
              <button
                onClick={() => setView("shop")}
                className="group inline-flex items-center justify-center gap-2 bg-background text-foreground px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-foreground hover:text-background transition-colors duration-300 w-full sm:w-auto rounded-full"
              >
                {t.promo.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => setView("story")}
                className="inline-flex items-center justify-center gap-2 border border-accent-foreground/40 text-accent-foreground px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent-foreground/10 transition-colors duration-300 w-full sm:w-auto rounded-full"
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
