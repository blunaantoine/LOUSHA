"use client";

import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";

export function StorySection() {
  const { lang, setView } = useStore();
  const t = useDict(lang);

  return (
    <section className="py-20 sm:py-28 bg-secondary/30 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Images */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] overflow-hidden bg-secondary mt-10">
                <img
                  src="/images/story/portrait-artisan.png"
                  alt={lang === "fr" ? "Artisan Lousha" : "Lousha artisan"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden bg-secondary">
                <img
                  src="/images/story/atelier-1.png"
                  alt={lang === "fr" ? "Atelier Lousha au Togo" : "Lousha atelier in Togo"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 aspect-[16/9] overflow-hidden bg-secondary shadow-xl hidden sm:block">
              <img
                src="/images/story/atelier-2.png"
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Text */}
          <div className="lg:pl-6">
            <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
              {t.story.eyebrow}
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl text-foreground text-balance leading-tight">
              {t.story.title}
            </h2>
            <p className="mt-6 text-base text-muted-foreground font-light leading-relaxed">
              {t.story.text1}
            </p>
            <p className="mt-4 text-base text-muted-foreground font-light leading-relaxed">
              {t.story.text2}
            </p>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {t.story.stats.map((s, i) => (
                <div key={i}>
                  <p className="font-serif text-3xl text-accent">{s.value}</p>
                  <p className="text-[11px] tracking-luxe-sm uppercase text-muted-foreground mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setView("shop")}
              className="group mt-9 inline-flex items-center gap-2 bg-foreground text-background px-7 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {t.story.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
