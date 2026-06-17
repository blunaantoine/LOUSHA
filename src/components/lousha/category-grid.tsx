"use client";

import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { useCategories } from "@/hooks/use-catalog";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function CategoryGrid() {
  const { lang, setView } = useStore();
  const t = useDict(lang);
  const { categories, loading } = useCategories();

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
            {t.categories.subtitle}
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground text-balance">
            {t.categories.title}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-secondary animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {categories.map((cat, idx) => {
              const name = lang === "fr" ? cat.name : cat.nameEn;
              const tagline = lang === "fr" ? cat.tagline : cat.taglineEn;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setView("shop")}
                  className={cn(
                    "group relative overflow-hidden bg-secondary text-left",
                    idx % 4 === 0 && "lg:col-span-1"
                  )}
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={cat.image}
                      alt={name}
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-background">
                    <p className="text-[10px] tracking-luxe-sm uppercase text-background/75 mb-1">
                      {tagline}
                    </p>
                    <div className="flex items-end justify-between gap-2">
                      <h3 className="font-serif text-2xl sm:text-3xl leading-tight">
                        {name}
                      </h3>
                      <span className="shrink-0 h-9 w-9 rounded-full border border-background/50 flex items-center justify-center transition-all duration-300 group-hover:bg-background group-hover:text-foreground">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
