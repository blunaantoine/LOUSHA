"use client";

import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { useCategories } from "@/hooks/use-catalog";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function CategoryGrid() {
  const { lang } = useStore();
  const router = useRouter();
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
                className="aspect-[3/4] bg-secondary animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-3 sm:gap-5">
            {categories.map((cat) => {
              const name = lang === "fr" ? cat.name : cat.nameEn;
              const tagline = lang === "fr" ? cat.tagline : cat.taglineEn;
              return (
                <button
                  key={cat.slug}
                  onClick={() => router.push("/shop")}
                  className={cn(
                    "group relative overflow-hidden bg-secondary text-left rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1",
                    "w-[calc(50%-0.375rem)] sm:w-[calc(50%-0.625rem)] lg:w-[calc(25%-0.9375rem)]"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent transition-opacity duration-500 group-hover:from-black/80" />
                  <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-6 text-background">
                    <p className="text-[10px] tracking-luxe-sm uppercase text-background/70 mb-1.5 transition-colors duration-300 group-hover:text-background/90">
                      {tagline}
                    </p>
                    <div className="flex items-end justify-between gap-2">
                      <h3 className="min-w-0 font-serif text-[13px] sm:text-2xl lg:text-[1.35rem] xl:text-2xl leading-tight [overflow-wrap:anywhere]">
                        {name}
                      </h3>
                      <span className="hidden sm:flex shrink-0 h-9 w-9 rounded-full border border-background/40 items-center justify-center transition-all duration-300 group-hover:bg-background group-hover:text-foreground group-hover:border-background group-hover:scale-110">
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
