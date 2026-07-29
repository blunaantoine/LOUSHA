"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface Slide {
  id: string;
  image: string;
  eyebrowFr: string;
  eyebrowEn: string;
  titleFr: string;
  titleEn: string;
  textFr: string;
  textEn: string;
}

// Fallback codé en dur si l'API ne répond pas (ex: premier rendu SSR)
const FALLBACK_SLIDES: Slide[] = [
  {
    id: "fb-1",
    image: "/images/hero/hero-1.png",
    eyebrowFr: "Le geste",
    eyebrowEn: "The gesture",
    titleFr: "Le savoir-faire des artisans",
    titleEn: "The artisans' know-how",
    textFr: "Chaque objet de décoration naît de mains expertes et de fibres naturelles.",
    textEn: "Each decorative object is born from expert hands and natural fibers.",
  },
  {
    id: "fb-2",
    image: "/images/hero/hero-2.png",
    eyebrowFr: "La matière",
    eyebrowEn: "The material",
    titleFr: "Raphia 100% naturel",
    titleEn: "100% natural raffia",
    textFr: "Une fibre noble, durable, puisée dans la richesse du Togo.",
    textEn: "A noble, durable fiber drawn from the richness of Togo.",
  },
  {
    id: "fb-3",
    image: "/images/hero/hero-3.png",
    eyebrowFr: "L'élégance",
    eyebrowEn: "Elegance",
    titleFr: "Un intérieur habité d'âme",
    titleEn: "An interior filled with soul",
    textFr: "Des créations de décoration qui réchauffent vos espaces de vie.",
    textEn: "Decorative creations that warm your living spaces.",
  },
];

export function HeroSlideshow() {
  const { lang, setView } = useStore();
  const t = useDict(lang);
  const [active, setActive] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Charge les slides depuis la DB (gérés via admin)
  useEffect(() => {
    let mounted = true;
    fetch("/api/hero", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { slides: [] }))
      .then((d) => {
        if (mounted) {
          if (d.slides && d.slides.length > 0) {
            setSlides(d.slides);
          } else {
            // Aucun slide en DB → utiliser le fallback
            setSlides(FALLBACK_SLIDES);
          }
          setLoaded(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setSlides(FALLBACK_SLIDES);
          setLoaded(true);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section className="w-full px-3 sm:px-5 lg:px-8 pt-3 sm:pt-4">
      {/* === La grande carte flottante aux coins arrondis — hauteur = largeur / 2 === */}
      <div className="relative w-full overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem] lg:rounded-[3rem] bg-secondary aspect-[2/1] min-h-[420px] shadow-[0_30px_80px_-40px_rgba(17,17,17,0.35)]">
        {/* Placeholder pendant le chargement des slides */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-background/30 border-t-background" />
          </div>
        )}
        {/* Slides — visuel produit au centre de la carte */}
        {loaded && slides.map((slide, i) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1400ms] ease-out",
              i === active ? "opacity-100" : "opacity-0"
            )}
            aria-hidden={i !== active}
          >
            <img
              src={slide.image}
              alt={lang === "fr" ? `Lousha — ${slide.titleFr}` : `Lousha — ${slide.titleEn}`}
              className={cn(
                "absolute inset-0 h-full w-full object-cover",
                i === active && "animate-kenburns"
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/55 via-black/20 to-black/40" />
          </div>
        ))}

        {/* === Contenu interne avec padding généreux === */}
        {loaded && slides[active] && (
        <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 lg:p-14">
          {/* Bloc haut-gauche : eyebrow + grand titre + bouton */}
          <div className="max-w-xl">
            <p
              key={`eyebrow-${active}-${lang}`}
              className="animate-fade-up text-shadow-luxe-sm text-[10px] sm:text-xs tracking-luxe uppercase text-background/85 mb-4 sm:mb-5"
            >
              {lang === "fr" ? slides[active].eyebrowFr : slides[active].eyebrowEn}
            </p>
            <h1
              key={`title-${active}-${lang}`}
              className="animate-fade-up text-shadow-luxe font-serif text-[2.2rem] leading-[1.05] sm:text-5xl lg:text-6xl xl:text-7xl text-background text-balance"
              style={{ animationDelay: "0.08s" }}
            >
              {lang === "fr" ? slides[active].titleFr : slides[active].titleEn}
            </h1>

            <div
              className="animate-fade-up mt-7 sm:mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "0.24s" }}
            >
              <button
                onClick={() => setView("shop")}
                className="group inline-flex items-center gap-2 bg-background text-foreground px-6 sm:px-7 py-3 sm:py-3.5 text-[11px] sm:text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors duration-300 rounded-full"
              >
                {t.hero.cta1}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => setView("story")}
                className="inline-flex items-center gap-2 border border-background/50 text-background px-6 sm:px-7 py-3 sm:py-3.5 text-[11px] sm:text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-background/10 transition-colors duration-300 rounded-full"
              >
                {t.hero.cta2}
              </button>
            </div>
          </div>

          {/* Bloc bas-droite : description + petites descriptions */}
          <div
            className="animate-fade-up flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5"
            style={{ animationDelay: "0.16s" }}
          >
            <p
              key={`text-${active}-${lang}`}
              className="text-shadow-luxe-sm text-sm sm:text-base lg:text-lg text-background/90 max-w-md font-light leading-relaxed"
            >
              {lang === "fr" ? slides[active].textFr : slides[active].textEn}
            </p>

            {/* Petites descriptions / indicateurs */}
            <div className="flex items-center gap-4">
              <span className="text-shadow-luxe-sm text-[10px] sm:text-[11px] tracking-luxe-sm uppercase text-background/70 font-sans">
                {String(active + 1).padStart(2, "0")}
                <span className="text-background/40">
                  {" "}
                  / {String(slides.length).padStart(2, "0")}
                </span>
              </span>
              <div className="flex items-center gap-2.5">
                {slides.map((slide, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className="group flex items-center"
                    aria-label={`Slide ${i + 1}`}
                  >
                    <span
                      className={cn(
                        "block h-px transition-all duration-500",
                        i === active
                          ? "w-10 sm:w-12 bg-background"
                          : "w-5 sm:w-6 bg-background/50 group-hover:bg-background/80"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
