"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useDict, formatPrice } from "@/lib/i18n";
import { useProduct } from "@/hooks/use-catalog";
import type { ProductVariant } from "@/hooks/use-catalog";
import {
  Minus,
  Plus,
  ShoppingBag,
  X,
  MapPin,
  Clock,
  Layers,
  Check,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

export function ProductDetail() {
  const {
    lang,
    currency,
    quickViewSlug,
    setQuickView,
    addToCart,
    setCartOpen,
    setCheckoutOpen,
  } = useStore();
  const t = useDict(lang);
  const { product, related, loading } = useProduct(quickViewSlug);
  const [qty, setQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  // Reset quand on change de produit
  const [prevSlug, setPrevSlug] = useState<string | null>(quickViewSlug);
  if (quickViewSlug !== prevSlug) {
    setPrevSlug(quickViewSlug);
    setQty(1);
    setSelectedVariantId(null);
  }

  const open = quickViewSlug !== null;

  if (!open) return null;

  const name = product ? (lang === "fr" ? product.name : product.nameEn) : "";
  const description = product
    ? lang === "fr"
      ? product.description
      : product.descriptionEn
    : "";

  // Variante sélectionnée (ou null = produit principal)
  const variants = product?.variants || [];
  const selectedVariant = selectedVariantId
    ? variants.find((v) => v.id === selectedVariantId)
    : null;

  // Prix / stock / image dynamiques selon la variante
  const currentPrice = selectedVariant?.priceCents ?? product?.priceCents ?? 0;
  const currentStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const currentImage = selectedVariant?.image ?? product?.image ?? "";
  const inStock = currentStock > 0;

  const handleAdd = () => {
    if (!product) return;
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
    setQuickView(null);
    setCartOpen(true);
  };

  const handleBuyNow = () => {
    if (!product) return;
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
    setQuickView(null);
    setCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-foreground/50 backdrop-blur-sm flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto scroll-elegant">
      <div
        className="absolute inset-0"
        onClick={() => setQuickView(null)}
      />
      <div className="relative bg-background w-full sm:max-w-5xl sm:rounded-3xl shadow-2xl max-h-screen sm:max-h-[92vh] overflow-y-auto scroll-elegant">
        {/* Close */}
        <button
          onClick={() => setQuickView(null)}
          className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-background/90 backdrop-blur border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {loading || !product ? (
          <div className="p-12 text-center text-muted-foreground">
            {t.common.loading}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 min-h-[400px]">
            {/* === Image (50%) === */}
            <div className="relative bg-secondary md:min-h-[600px] aspect-[3/4] md:aspect-auto overflow-hidden">
              <img
                src={currentImage}
                alt={name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {product.badge !== "none" && (
                <span className="absolute top-4 left-4 z-10 bg-accent/10 text-accent text-[10px] tracking-luxe-sm uppercase px-3 py-1 font-sans rounded-full">
                  {product.badge === "new" ? t.products.new : t.products.bestseller}
                </span>
              )}
            </div>

            {/* === Informations (50%) === */}
            <div className="p-6 sm:p-10 flex flex-col">
              <p className="text-[11px] tracking-luxe uppercase text-muted-foreground mb-2">
                {product.category
                  ? lang === "fr"
                    ? product.category.name
                    : product.category.nameEn
                  : ""}
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl text-foreground leading-tight">
                {name}
              </h1>

              {/* Prix dynamique */}
              <p className="mt-4 font-serif text-2xl text-accent">
                {formatPrice(currentPrice, lang, currency)}
              </p>

              {/* Stock dynamique */}
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
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground font-light">
                {description}
              </p>

              {/* === Variantes === */}
              {variants.length > 0 && (
                <div className="mt-6">
                  <p className="text-[11px] tracking-luxe-sm uppercase text-muted-foreground mb-3">
                    {t.product.variants}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {/* Option "par défaut" = produit principal */}
                    <button
                      onClick={() => setSelectedVariantId(null)}
                      className={cn(
                        "px-4 py-2 text-[12px] tracking-luxe-sm uppercase font-sans rounded-full border transition-all",
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
                          "px-4 py-2 text-[12px] tracking-luxe-sm uppercase font-sans rounded-full border transition-all",
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
                <p className="font-serif text-lg text-foreground">
                  {formatPrice(currentPrice * qty, lang, currency)}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-3">
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
        )}

        {/* === Produits similaires === */}
        {!loading && product && related.length > 0 && (
          <div className="border-t-2 border-border p-6 sm:p-10 bg-secondary/40">
            <h3 className="font-serif text-2xl text-foreground mb-6 mt-2">
              {t.product.related}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
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
