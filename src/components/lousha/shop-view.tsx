"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { useProducts, useCategories } from "@/hooks/use-catalog";
import { ProductCard } from "./product-card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "new" | "price-asc" | "price-desc";

export function ShopView() {
  const { lang } = useStore();
  const t = useDict(lang);
  const { categories } = useCategories();
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("new");

  const { products, loading } = useProducts(
    category === "all" ? {} : { category }
  );

  const sorted = useMemo(() => {
    const list = [...products];
    if (sort === "price-asc") list.sort((a, b) => a.priceCents - b.priceCents);
    else if (sort === "price-desc")
      list.sort((a, b) => b.priceCents - a.priceCents);
    else list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return list;
  }, [products, sort]);

  return (
    <section className="py-16 sm:py-24 bg-background min-h-[60vh]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
            {t.shop.subtitle}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground">
            {t.shop.title}
          </h1>
        </div>

        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-y border-border py-4 mb-10">
          {/* Categories */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <FilterChip
              active={category === "all"}
              onClick={() => setCategory("all")}
            >
              {t.shop.all}
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c.slug}
                active={category === c.slug}
                onClick={() => setCategory(c.slug)}
              >
                {lang === "fr" ? c.name : c.nameEn}
              </FilterChip>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] tracking-luxe-sm uppercase text-muted-foreground">
              {t.shop.sort}
            </span>
            <div className="flex items-center gap-1">
              <SortChip active={sort === "new"} onClick={() => setSort("new")}>
                {t.shop.sortNew}
              </SortChip>
              <SortChip
                active={sort === "price-asc"}
                onClick={() => setSort("price-asc")}
              >
                € ↑
              </SortChip>
              <SortChip
                active={sort === "price-desc"}
                onClick={() => setSort("price-desc")}
              >
                € ↓
              </SortChip>
            </div>
          </div>
        </div>

        {/* Count */}
        <p className="text-xs tracking-luxe-sm uppercase text-muted-foreground mb-6">
          {!loading ? t.shop.results(sorted.length) : t.common.loading}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[4/5] bg-secondary animate-pulse" />
                <div className="mt-4 h-5 w-3/4 bg-secondary animate-pulse" />
                <div className="mt-2 h-4 w-1/3 bg-secondary animate-pulse" />
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-muted-foreground">
              {t.shop.empty}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {sorted.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 text-[11px] tracking-luxe-sm uppercase font-sans transition-colors border",
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-transparent text-foreground/70 border-border hover:border-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function SortChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-[11px] tracking-luxe-sm uppercase font-sans transition-colors flex items-center gap-1",
        active ? "text-accent" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {active && <Check className="h-3 w-3" />}
      {children}
    </button>
  );
}


