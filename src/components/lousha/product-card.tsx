"use client";

import { useStore } from "@/lib/store";
import { useDict, formatPrice } from "@/lib/i18n";
import type { Product } from "@/hooks/use-catalog";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {
  const { lang, currency, setQuickView, addToCart, setCartOpen } = useStore();
  const t = useDict(lang);

  const name = lang === "fr" ? product.name : product.nameEn;
  const badgeLabel =
    product.badge === "new"
      ? t.products.new
      : product.badge === "bestseller"
      ? t.products.bestseller
      : null;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      slug: product.slug,
      name: product.name,
      nameEn: product.nameEn,
      priceCents: product.priceCents,
      image: product.image,
    });
    toast.success(lang === "fr" ? "Ajouté au panier" : "Added to cart", {
      description: name,
    });
    setCartOpen(true);
  };

  return (
    <div className="group flex flex-col">
      <button
        onClick={() => setQuickView(product.slug)}
        className="relative block overflow-hidden bg-secondary aspect-[4/3] text-left rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-500"
      >
        <img
          src={product.image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {badgeLabel && (
          <span className="absolute top-3 left-3 bg-background/95 backdrop-blur text-foreground text-[10px] tracking-luxe-sm uppercase px-3 py-1.5 font-sans rounded-full">
            {badgeLabel}
          </span>
        )}
      </button>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            onClick={() => setQuickView(product.slug)}
            className="block text-left"
          >
            <h3 className="font-serif text-lg sm:text-xl text-foreground leading-snug hover:text-accent transition-colors">
              {name}
            </h3>
          </button>
          <p className="text-sm text-accent font-medium mt-1">
            {formatPrice(product.priceCents, lang, currency)}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="shrink-0 h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-110 shadow-sm"
          aria-label={t.products.addToCart}
        >
          <ShoppingBag className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
