"use client";

import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/lib/store";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface PromoSlide {
  id: string;
  image: string;
  titleFr: string;
  titleEn: string;
  textFr: string;
  textEn: string;
  linkView: string;
  linkLabelFr: string;
  linkLabelEn: string;
}

const FALLBACK: PromoSlide[] = [
  {
    id: "fallback",
    image: "/images/hero/hero-2.png",
    titleFr: "L'art du raphia",
    titleEn: "The art of raffia",
    textFr: "Des pièces uniques tissées à la main au Togo.",
    textEn: "Unique pieces handwoven in Togo.",
    linkView: "shop",
    linkLabelFr: "Découvrir",
    linkLabelEn: "Discover",
  },
];

export function PromoBanner() {
  const { lang, setView } = useStore();
  const [slides, setSlides] = useState<PromoSlide[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  const load = useCallback(() => {
    fetch("/api/promo")
      .then((r) => r.json())
      .then((d) => setSlides((d.slides?.length ? d.slides : FALLBACK) as PromoSlide[]))
      .catch(() => setSlides(FALLBACK));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-rotation
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;

  const s = slides[activeIdx];
  const prev = () => setActiveIdx((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setActiveIdx((i) => (i + 1) % slides.length);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-24 sm:my-32 lg:my-36">
      <div className="relative bg-accent text-accent-foreground rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] shadow-[0_30px_80px_-30px_rgba(49,27,0,0.5)]">
        {/* Décor de fond */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)", backgroundSize: "22px 22px" }}
        />

        {/* Image pop-out 3D */}
        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-28 sm:-top-36 lg:-top-48 z-20 w-[320px] sm:w-[427px] lg:w-[560px] flex justify-center">
          {slides.map((slide, i) => (
            <img
              key={slide.id}
              src={slide.image}
              alt=""
              className={`w-full h-auto object-contain transition-opacity duration-[1400ms] ease-out ${i === activeIdx ? "opacity-100 relative" : "opacity-0 absolute"}`}
              style={{ filter: "drop-shadow(0 30px 30px rgba(0,0,0,0.45)) drop-shadow(0 12px 12px rgba(0,0,0,0.3))" }}
              draggable={false}
            />
          ))}
        </div>

        {/* Indicateurs */}
        {slides.length > 1 && (
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className="h-px transition-all duration-500"
                style={{ width: i === activeIdx ? "32px" : "16px", backgroundColor: i === activeIdx ? "#FFFFFF" : "rgba(255,255,255,0.4)" }}
              />
            ))}
          </div>
        )}

        {/* Contenu */}
        <div className="relative grid lg:grid-cols-2 items-center gap-8 px-6 sm:px-10 lg:px-14 pt-44 sm:pt-56 lg:pt-64 pb-10 sm:pb-12 lg:pb-14">
          {/* Gauche */}
          <div className="text-center lg:text-left z-10">
            <p className="text-[10px] sm:text-xs tracking-luxe uppercase text-accent-foreground/70 mb-3 sm:mb-4">
              {lang === "fr" ? "Collection" : "Collection"}
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.05] text-balance">
              {lang === "fr" ? s.titleFr : s.titleEn}
            </h2>
          </div>

          {/* Droite */}
          <div className="text-center lg:text-right z-10 lg:max-w-xs lg:ml-auto">
            <p className="text-sm sm:text-base text-accent-foreground/85 font-light leading-relaxed mb-6 lg:mb-8">
              {lang === "fr" ? s.textFr : s.textEn}
            </p>
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-3 justify-center lg:justify-end">
              <button
                onClick={() => setView(s.linkView as "shop" | "story" | "material" | "contact")}
                className="group inline-flex items-center justify-center gap-2 bg-background text-foreground px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-foreground hover:text-background transition-colors duration-300 w-full sm:w-auto rounded-full"
              >
                {lang === "fr" ? (s.linkLabelFr || "Découvrir") : (s.linkLabelEn || "Discover")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Flèches navigation */}
              {slides.length > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={prev} className="h-9 w-9 rounded-full flex items-center justify-center border border-accent-foreground/30 text-accent-foreground hover:bg-accent-foreground/10 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={next} className="h-9 w-9 rounded-full flex items-center justify-center border border-accent-foreground/30 text-accent-foreground hover:bg-accent-foreground/10 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
