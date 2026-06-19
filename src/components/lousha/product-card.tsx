"use client";

import { useStore } from "@/lib/store";
import { useDict, formatPrice } from "@/lib/i18n";
import type { Product } from "@/hooks/use-catalog";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
import { InteractiveProductCard } from "@/components/ui/card-7";

export function ProductCard({ product }: { product: Product }) {
  const { lang, currency, openProduct, addToCart, setCartOpen } = useStore();
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
        onClick={() => openProduct(product.slug)}
        className="block text-left w-full"
      >
        <InteractiveProductCard
          imageUrl={product.image}
          title={name}
          badge={badgeLabel}
        />
      </button>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            onClick={() => openProduct(product.slug)}
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
