"use client";

import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { useProducts } from "@/hooks/use-catalog";
import { ProductCard } from "./product-card";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function FeaturedProducts() {
  const { lang } = useStore();
  const router = useRouter();
  const t = useDict(lang);
  const { products, loading } = useProducts({ featured: true });

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 sm:mb-14">
          <div>
            <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
              {t.products.subtitle}
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground text-balance">
              {t.products.title}
            </h2>
          </div>
          <button
            onClick={() => router.push("/shop")}
            className="group inline-flex items-center gap-2 text-[12px] tracking-luxe-sm uppercase font-sans text-foreground/80 hover:text-accent transition-colors"
          >
            {t.products.viewAll}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[4/5] bg-secondary animate-pulse" />
                <div className="mt-4 h-5 w-3/4 bg-secondary animate-pulse" />
                <div className="mt-2 h-4 w-1/3 bg-secondary animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
