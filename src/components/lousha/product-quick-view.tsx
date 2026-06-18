"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useDict, formatPrice } from "@/lib/i18n";
import { useProduct } from "@/hooks/use-catalog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag, X, MapPin, Clock, Layers } from "lucide-react";
import { ProductCard } from "./product-card";

export function ProductQuickView() {
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
  const [prevSlug, setPrevSlug] = useState<string | null>(quickViewSlug);

  // Reset qty when the opened product changes (official React pattern).
  if (quickViewSlug !== prevSlug) {
    setPrevSlug(quickViewSlug);
    setQty(1);
  }

  const open = quickViewSlug !== null;

  const name = product ? (lang === "fr" ? product.name : product.nameEn) : "";
  const description = product
    ? lang === "fr"
      ? product.description
      : product.descriptionEn
    : "";

  const handleAdd = () => {
    if (!product) return;
    addToCart(
      {
        slug: product.slug,
        name: product.name,
        nameEn: product.nameEn,
        priceCents: product.priceCents,
        image: product.image,
      },
      qty
    );
    toast.success(lang === "fr" ? "Ajouté au panier" : "Added to cart", {
      description: name,
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
        priceCents: product.priceCents,
        image: product.image,
      },
      qty
    );
    setQuickView(null);
    setCheckoutOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && setQuickView(null)}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-background gap-0 rounded-3xl max-h-[92vh] overflow-y-auto scroll-elegant">
        <DialogTitle className="sr-only">{name}</DialogTitle>
        {loading || !product ? (
          <div className="p-12 text-center text-muted-foreground">
            {t.common.loading}
          </div>
        ) : (
          <>
            {/* Close button */}
            <button
              onClick={() => setQuickView(null)}
              className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-background/90 backdrop-blur border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid md:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-square md:aspect-auto md:min-h-[560px] bg-secondary">
                <img
                  src={product.image}
                  alt={name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {product.badge !== "none" && (
                  <span className="absolute top-4 left-4 bg-background/95 backdrop-blur text-foreground text-[10px] tracking-luxe-sm uppercase px-3 py-1.5 font-sans rounded-full">
                    {product.badge === "new"
                      ? t.products.new
                      : t.products.bestseller}
                  </span>
                )}
              </div>

              {/* Details */}
              <div className="p-6 sm:p-10 flex flex-col">
                <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
                  {product.category
                    ? lang === "fr"
                      ? product.category.name
                      : product.category.nameEn
                    : ""}
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl text-foreground leading-tight">
                  {name}
                </h2>
                <p className="mt-4 font-serif text-2xl text-foreground">
                  {formatPrice(product.priceCents, lang, currency)}
                </p>

                <div className="mt-5 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs ${
                      product.inStock ? "text-accent" : "text-destructive"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        product.inStock ? "bg-accent" : "bg-destructive"
                      }`}
                    />
                    {product.inStock ? t.product.inStock : t.product.outOfStock}
                  </span>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-muted-foreground font-light">
                  {description}
                </p>

                {/* Specs */}
                <div className="mt-6 grid grid-cols-1 gap-2.5 border-t border-border pt-5">
                  <Spec
                    icon={<Layers className="h-4 w-4" />}
                    label={t.product.material}
                    value={product.material}
                  />
                  <Spec
                    icon={<MapPin className="h-4 w-4" />}
                    label={t.product.origin}
                    value={product.origin}
                  />
                  <Spec
                    icon={<Clock className="h-4 w-4" />}
                    label={t.product.craftingTime}
                    value={product.craftingTime}
                  />
                </div>

                {/* Quantity + total */}
                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] tracking-luxe-sm uppercase text-muted-foreground">
                      {t.product.quantity}
                    </span>
                    <div className="flex items-center border border-border rounded-full">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="h-9 w-9 flex items-center justify-center hover:bg-secondary transition rounded-l-full"
                        aria-label="-"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-sans">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty((q) => q + 1)}
                        className="h-9 w-9 flex items-center justify-center hover:bg-secondary transition rounded-r-full"
                        aria-label="+"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="font-serif text-lg text-foreground">
                    {formatPrice(product.priceCents * qty, lang, currency)}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAdd}
                    className="group inline-flex items-center justify-center gap-2 border border-foreground text-foreground px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-foreground hover:text-background transition-colors flex-1 rounded-full"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {t.product.addToCart}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="inline-flex items-center justify-center bg-accent text-accent-foreground px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent/90 transition-colors flex-1 rounded-full"
                  >
                    {t.product.buyNow}
                  </button>
                </div>
              </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div className="border-t border-border p-6 sm:p-10 bg-secondary/30">
                <h3 className="font-serif text-2xl text-foreground mb-6">
                  {t.product.related}
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8">
                  {related.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
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
