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
  Check,
  Share2,
  Link2,
  MessageCircle,
  Facebook,
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
    paymentEnabled,
  } = useStore();
  const t = useDict(lang);
  const { product, related, loading, error } = useProduct(productSlug);
  const [qty, setQty] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  if (loading || (!product && !error)) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <span className="h-6 w-6 border-2 border-border border-t-accent rounded-full animate-spin" />
      </section>
    );
  }

  if (!product || error) {
    return (
      <section className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="font-serif text-2xl text-muted-foreground">
          {lang === "fr" ? "Produit introuvable" : "Product not found"}
        </p>
        <button
          onClick={() => setView("shop")}
          className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[12px] tracking-luxe-sm uppercase font-sans rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {lang === "fr" ? "Retour à la boutique" : "Back to shop"}
        </button>
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

  const handleWhatsAppOrder = () => {
    const WHATSAPP_NUMBER = "22896692972";
    const variantLabel = selectedVariant
      ? ` — ${lang === "fr" ? selectedVariant.label : selectedVariant.labelEn || selectedVariant.label}`
      : "";
    const message = lang === "fr"
      ? `Bonjour Lousha Accessories 👋\n\nJe souhaite commander :\n\n📦 ${name}${variantLabel}\n💰 Prix : ${formatPrice(currentPrice, lang, currency)}\n🔢 Quantité : ${qty}\n\nLien : ${window.location.origin}/?product=${product.slug}\n\nMerci de me confirmer la disponibilité et les modalités.`
      : `Hello Lousha Accessories 👋\n\nI'd like to order:\n\n📦 ${name}${variantLabel}\n💰 Price: ${formatPrice(currentPrice, lang, currency)}\n🔢 Quantity: ${qty}\n\nLink: ${window.location.origin}/?product=${product.slug}\n\nPlease confirm availability and payment details.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
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

            {/* === Variantes (couleurs + options) === */}
            {variants.length > 0 && (
              <div className="mt-6">
                <p className="text-[11px] tracking-luxe-sm uppercase text-muted-foreground mb-3">
                  {t.product.variants}
                  {selectedVariant && (
                    <span className="ml-2 text-foreground/80 normal-case tracking-normal">
                      : {lang === "fr" ? selectedVariant.label : selectedVariant.labelEn || selectedVariant.label}
                    </span>
                  )}
                </p>

                {/* Sélecteur de couleurs (cercles) */}
                {variants.some((v) => v.color) && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {/* Option standard */}
                    <button
                      onClick={() => setSelectedVariantId(null)}
                      className={cn(
                        "h-9 w-9 rounded-full border-2 transition-all flex items-center justify-center",
                        !selectedVariantId
                          ? "border-foreground scale-110"
                          : "border-border hover:border-foreground/50"
                      )}
                      title={t.product.default}
                    >
                      <span className="h-6 w-6 rounded-full bg-gradient-to-br from-ecru to-sable" style={{ background: "linear-gradient(135deg, #F4F4F6, #5A5A5A)" }} />
                    </button>
                    {/* Cercles de couleur */}
                    {variants.filter((v) => v.color).map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={cn(
                          "h-9 w-9 rounded-full border-2 transition-all flex items-center justify-center",
                          selectedVariantId === v.id
                            ? "border-foreground scale-110"
                            : "border-border hover:border-foreground/50 hover:scale-105"
                        )}
                        title={lang === "fr" ? v.label : v.labelEn || v.label}
                        style={{ backgroundColor: v.color || undefined }}
                      >
                        {selectedVariantId === v.id && (
                          <Check className="h-4 w-4 text-white drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Boutons pour variantes sans couleur (taille, modèle...) */}
                {variants.filter((v) => !v.color).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {variants.filter((v) => !v.color).map((v) => (
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
                )}

                {/* Miniatures d'images des variantes */}
                {variants.some((v) => v.image) && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {/* Miniature produit standard */}
                    <button
                      onClick={() => setSelectedVariantId(null)}
                      className={cn(
                        "h-16 w-16 rounded-xl overflow-hidden border-2 transition-all",
                        !selectedVariantId
                          ? "border-foreground"
                          : "border-border hover:border-foreground/50"
                      )}
                    >
                      <img src={product.image} alt="" className="h-full w-full object-cover" />
                    </button>
                    {variants.filter((v) => v.image).map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={cn(
                          "h-16 w-16 rounded-xl overflow-hidden border-2 transition-all",
                          selectedVariantId === v.id
                            ? "border-foreground"
                            : "border-border hover:border-foreground/50"
                        )}
                      >
                        <img src={v.image!} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Specs */}
            <div className="mt-6 grid grid-cols-1 gap-2.5 border-t border-border pt-5">
              <Spec icon={<Layers className="h-4 w-4" />} label={t.product.material} value={product.material} />
              <Spec icon={<MapPin className="h-4 w-4" />} label={t.product.origin} value={product.origin} />
              <Spec icon={<Clock className="h-4 w-4" />} label={t.product.craftingTime} value={product.craftingTime} />
            </div>

            {/* === Partage === */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-[11px] tracking-luxe-sm uppercase text-muted-foreground flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5" />
                {lang === "fr" ? "Partager" : "Share"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    const text = lang === "fr" ? `Découvrez ${name} sur Lousha Accessories` : `Check out ${name} on Lousha Accessories`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
                  }}
                  className="h-9 w-9 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:bg-[#25D366] hover:text-white transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
                  }}
                  className="h-9 w-9 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition-colors"
                  title="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    toast.success(lang === "fr" ? "Lien copié" : "Link copied");
                  }}
                  className="h-9 w-9 rounded-full bg-secondary text-muted-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
                  title={lang === "fr" ? "Copier le lien" : "Copy link"}
                >
                  <Link2 className="h-4 w-4" />
                </button>
              </div>
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
              {paymentEnabled && (
                <button
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className="inline-flex items-center justify-center bg-accent text-accent-foreground px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent/90 transition-all flex-1 rounded-full shadow-sm disabled:opacity-50"
                >
                  {t.product.buyNow}
                </button>
              )}
              <button
                onClick={handleWhatsAppOrder}
                disabled={!inStock}
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-[#1eb858] transition-all flex-1 rounded-full shadow-sm disabled:opacity-50"
              >
                <MessageCircle className="h-4 w-4" />
                {lang === "fr" ? "Commander sur WhatsApp" : "Order on WhatsApp"}
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
