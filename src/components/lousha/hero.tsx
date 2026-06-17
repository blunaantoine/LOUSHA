"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

const SLIDES = [
  { image: "/images/hero/hero-1.png" },
  { image: "/images/hero/hero-2.png" },
  { image: "/images/hero/hero-3.png" },
];

export function HeroSlideshow() {
  const { lang, setView } = useStore();
  const t = useDict(lang);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative w-full h-[88vh] min-h-[560px] max-h-[860px] overflow-hidden bg-secondary">
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 transition-opacity duration-[1400ms] ease-out",
            i === active ? "opacity-100" : "opacity-0"
          )}
          aria-hidden={i !== active}
        >
          <img
            src={slide.image}
            alt=""
            className={cn(
              "absolute inset-0 h-full w-full object-cover",
              i === active && "animate-kenburns"
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/45" />
        </div>
      ))}

      {/* Content */}
      <div className="relative h-full mx-auto max-w-7xl px-6 lg:px-8 flex items-end pb-20 lg:pb-28">
        <div className="max-w-2xl text-background">
          <p
            key={`eyebrow-${active}-${lang}`}
            className="animate-fade-up text-[11px] sm:text-xs tracking-luxe uppercase text-background/85 mb-5"
          >
            {t.hero.slides[active].eyebrow}
          </p>
          <h1
            key={`title-${active}-${lang}`}
            className="animate-fade-up font-serif text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-7xl text-background text-balance"
            style={{ animationDelay: "0.08s" }}
          >
            {t.hero.slides[active].title}
          </h1>
          <p
            key={`text-${active}-${lang}`}
            className="animate-fade-up mt-5 text-base sm:text-lg text-background/90 max-w-xl font-light"
            style={{ animationDelay: "0.16s" }}
          >
            {t.hero.slides[active].text}
          </p>

          <div
            className="animate-fade-up mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "0.24s" }}
          >
            <button
              onClick={() => setView("shop")}
              className="group inline-flex items-center gap-2 bg-background text-foreground px-7 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors duration-300"
            >
              {t.hero.cta1}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => setView("story")}
              className="inline-flex items-center gap-2 border border-background/50 text-background px-7 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-background/10 transition-colors duration-300"
            >
              {t.hero.cta2}
            </button>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 right-6 lg:right-8 flex items-center gap-3 z-10">
        {SLIDES.map((_, i) => (
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
                  ? "w-12 bg-background"
                  : "w-6 bg-background/50 group-hover:bg-background/80"
              )}
            />
          </button>
        ))}
      </div>

      {/* Scroll hint */}
      <div className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-background/70">
        <span className="text-[10px] tracking-luxe uppercase">Scroll</span>
        <span className="block w-px h-10 bg-background/40 relative overflow-hidden">
          <span className="absolute inset-0 bg-background animate-[fadeIn_1.4s_ease-in-out_infinite_alternate]" />
        </span>
      </div>
    </section>
  );
}
