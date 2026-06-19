"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useDict, formatPrice } from "@/lib/i18n";
import { useProduct } from "@/hooks/use-catalog";
import {
  Minus,
  Plus,
  ShoppingBag,
  MapPin,
  Clock,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

export function ProductPage() {
  const {
    lang,
    currency,
    productSlug,
    setView,
    addToCart,
    setCartOpen,
    setCheckoutOpen,
  } = useStore();
  const t = useDict(lang);
  const { product, related, loading } = useProduct(productSlug);
  const [qty, setQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  if (loading || !product) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <span className="h-6 w-6 border-2 border-border border-t-accent rounded-full animate-spin" />
      </section>
    );
  }

  const name = lang === "fr" ? product.name : product.nameEn;
  const description = lang === "fr" ? product.description : product.descriptionEn;

  const variants = product.variants || [];
  const selectedVariant = selectedVariantId
    ? variants.find((v) => v.id === selectedVariantId)
    : null;

  const currentPrice = selectedVariant?.priceCents ?? product.priceCents;
  const currentStock = selectedVariant?.stock ?? product.stock ?? 0;
  const currentImage = selectedVariant?.image ?? product.image;
  const inStock = currentStock > 0;

  const handleAdd = () => {
    addToCart(
      {
        slug: product.slug,
        name: product.name,
        nameEn: product.nameEn,
        priceCents: currentPrice,
        image: currentImage,
      },
      qty
    );
    toast.success(lang === "fr" ? "Ajouté au panier" : "Added to cart", {
      description: name + (selectedVariant ? ` — ${selectedVariant.label}` : ""),
    });
    setCartOpen(true);
  };

  const handleBuyNow = () => {
    addToCart(
      {
        slug: product.slug,
        name: product.name,
        nameEn: product.nameEn,
        priceCents: currentPrice,
        image: currentImage,
      },
      qty
    );
    setCheckoutOpen(true);
  };

  return (
    <section className="py-8 sm:py-12 bg-background min-h-[60vh]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / retour */}
        <button
          onClick={() => setView("shop")}
          className="inline-flex items-center gap-2 text-[11px] tracking-luxe-sm uppercase font-sans text-muted-foreground hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {lang === "fr" ? "Retour à la boutique" : "Back to shop"}
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* === Image (50%) === */}
          <div className="relative bg-secondary aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden shadow-sm">
            <img
              src={currentImage}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {product.badge !== "none" && (
              <span className="absolute top-4 left-4 z-10 bg-background/95 backdrop-blur text-foreground text-[10px] tracking-luxe-sm uppercase px-3 py-1.5 font-sans rounded-full shadow-sm">
                {product.badge === "new" ? t.products.new : t.products.bestseller}
              </span>
            )}
          </div>

          {/* === Informations (50%) === */}
          <div className="flex flex-col">
            <p className="text-[11px] tracking-luxe uppercase text-muted-foreground mb-2">
              {product.category
                ? lang === "fr"
                  ? product.category.name
                  : product.category.nameEn
                : ""}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight">
              {name}
            </h1>

            {/* Prix */}
            <p className="mt-4 font-serif text-2xl sm:text-3xl text-accent">
              {formatPrice(currentPrice, lang, currency)}
            </p>

            {/* Stock */}
            <div className="mt-3 flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs",
                  inStock ? "text-accent" : "text-destructive"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    inStock ? "bg-accent" : "bg-destructive"
                  )}
                />
                {inStock
                  ? `${t.product.inStock} (${currentStock})`
                  : t.product.outOfStock}
              </span>
            </div>

            {/* Description */}
            <p className="mt-5 text-sm sm:text-base leading-relaxed text-muted-foreground font-light">
              {description}
            </p>

            {/* === Variantes === */}
            {variants.length > 0 && (
              <div className="mt-6">
                <p className="text-[11px] tracking-luxe-sm uppercase text-muted-foreground mb-3">
                  {t.product.variants}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedVariantId(null)}
                    className={cn(
                      "px-4 py-2.5 text-[12px] tracking-luxe-sm uppercase font-sans rounded-full border transition-all",
                      !selectedVariantId
                        ? "bg-foreground text-background border-foreground"
                        : "border-border text-foreground/70 hover:border-foreground"
                    )}
                  >
                    {t.product.default}
                  </button>
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={cn(
                        "px-4 py-2.5 text-[12px] tracking-luxe-sm uppercase font-sans rounded-full border transition-all",
                        selectedVariantId === v.id
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-foreground/70 hover:border-foreground"
                      )}
                    >
                      {lang === "fr" ? v.label : v.labelEn || v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specs */}
            <div className="mt-6 grid grid-cols-1 gap-2.5 border-t border-border pt-5">
              <Spec icon={<Layers className="h-4 w-4" />} label={t.product.material} value={product.material} />
              <Spec icon={<MapPin className="h-4 w-4" />} label={t.product.origin} value={product.origin} />
              <Spec icon={<Clock className="h-4 w-4" />} label={t.product.craftingTime} value={product.craftingTime} />
            </div>

            {/* Quantité + total */}
            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-[11px] tracking-luxe-sm uppercase text-muted-foreground">
                  {t.product.quantity}
                </span>
                <div className="flex items-center border border-border rounded-full">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="h-9 w-9 flex items-center justify-center hover:bg-secondary transition rounded-l-full"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-sans">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="h-9 w-9 flex items-center justify-center hover:bg-secondary transition rounded-r-full"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="font-serif text-lg sm:text-xl text-foreground">
                {formatPrice(currentPrice * qty, lang, currency)}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-auto pt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAdd}
                disabled={!inStock}
                className="group inline-flex items-center justify-center gap-2 border border-foreground text-foreground px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-foreground hover:text-background transition-all flex-1 rounded-full shadow-sm disabled:opacity-50"
              >
                <ShoppingBag className="h-4 w-4" />
                {t.product.addToCart}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className="inline-flex items-center justify-center bg-accent text-accent-foreground px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent/90 transition-all flex-1 rounded-full shadow-sm disabled:opacity-50"
              >
                {t.product.buyNow}
              </button>
            </div>
          </div>
        </div>

        {/* === Produits similaires === */}
        {related.length > 0 && (
          <div className="mt-16 sm:mt-24 border-t border-border pt-12">
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-8">
              {t.product.related}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-accent shrink-0">{icon}</span>
      <span className="text-muted-foreground tracking-luxe-sm uppercase text-[11px] w-32 shrink-0">
        {label}
      </span>
      <span className="text-foreground font-light">{value}</span>
    </div>
  );
}
