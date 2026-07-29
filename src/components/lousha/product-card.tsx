"use client";

import { useStore } from "@/lib/store";
import { useDict, formatPrice } from "@/lib/i18n";
import type { Product } from "@/hooks/use-catalog";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { InteractiveProductCard } from "@/components/ui/card-7";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function ProductCard({ product }: { product: Product }) {
  const { lang, currency, addToCart, setCartOpen } = useStore();
  const t = useDict(lang);

  const name = lang === "fr" ? product.name : product.nameEn;
  const badgeLabel =
    product.badge === "new"
      ? t.products.new
      : product.badge === "bestseller"
      ? t.products.bestseller
      : null;

  const variants = product.variants || [];
  const colorVariants = variants.filter((v) => v.color);
  const hasMultiplePrices = variants.length > 0 && variants.some((v) => v.priceCents !== product.priceCents);

  // Prix "à partir de" si les variantes ont des prix différents
  const displayPrice = hasMultiplePrices
    ? `${t.products.from} ${formatPrice(Math.min(product.priceCents, ...variants.map((v) => v.priceCents)), lang, currency)}`
    : formatPrice(product.priceCents, lang, currency);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
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
      <Link
        href={`/product/${product.slug}`}
        className="block text-left w-full"
      >
        <InteractiveProductCard
          imageUrl={product.image}
          title={name}
          badge={badgeLabel}
        />
      </Link>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/product/${product.slug}`}
            className="block text-left"
          >
            <h3 className="font-serif text-lg sm:text-xl text-foreground leading-snug hover:text-accent transition-colors">
              {name}
            </h3>
          </Link>
          <p className="text-sm text-accent font-medium mt-1">
            {displayPrice}
          </p>
          {/* Indicateurs de couleurs disponibles */}
          {colorVariants.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className="h-3 w-3 rounded-full border border-border"
                style={{ background: "linear-gradient(135deg, #F4F4F6, #5A5A5A)" }}
                title={t.product.default}
              />
              {colorVariants.map((v) => (
                <span
                  key={v.id}
                  className="h-3 w-3 rounded-full border border-border"
                  style={{ backgroundColor: v.color! }}
                  title={lang === "fr" ? v.label : v.labelEn || v.label}
                />
              ))}
            </div>
          )}
          {/* Nombre de variantes sans couleur (taille, modèle...) */}
          {variants.filter((v) => !v.color).length > 0 && (
            <p className="text-[11px] text-muted-foreground mt-1 tracking-luxe-sm uppercase">
              {variants.length} {lang === "fr" ? "options" : "options"}
            </p>
          )}
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
