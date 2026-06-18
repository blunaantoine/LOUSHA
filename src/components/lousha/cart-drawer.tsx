"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { useDict, formatPrice } from "@/lib/i18n";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Seuil de livraison offerte : 80 € ≈ 52 500 XOF (en centimes de XOF)
const FREE_SHIPPING_THRESHOLD = 5250000;
const SHIPPING_COST_XOF_CENTS = 425000; // ~6,50 €

export function CartDrawer() {
  const {
    lang,
    currency,
    cartOpen,
    setCartOpen,
    items,
    setQty,
    removeFromCart,
    cartTotal,
    setView,
    setCheckoutOpen,
  } = useStore();
  const t = useDict(lang);

  // Lock body scroll
  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  const subtotal = cartTotal();
  const shippingFree = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0;
  const shipping = shippingFree ? 0 : SHIPPING_COST_XOF_CENTS;
  const total = subtotal + shipping;
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition-all duration-300",
        cartOpen ? "visible" : "invisible"
      )}
      aria-hidden={!cartOpen}
    >
      {/* Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300",
          cartOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={() => setCartOpen(false)}
      />

      {/* Panel */}
      <aside
        className={cn(
          "absolute right-0 top-0 h-full w-full max-w-md bg-background shadow-2xl flex flex-col transition-transform duration-400 ease-out",
          cartOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label={t.cart.title}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-accent" />
            <h2 className="font-serif text-xl">{t.cart.title}</h2>
            <span className="text-xs text-muted-foreground">
              ({items.length})
            </span>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:opacity-60 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 text-center">
            <span className="h-16 w-16 rounded-full border border-border flex items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <p className="font-serif text-xl text-muted-foreground">
              {t.cart.empty}
            </p>
            <button
              onClick={() => {
                setCartOpen(false);
                setView("shop");
              }}
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors rounded-full"
            >
              {t.cart.emptyCta}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="px-6 py-4 bg-secondary/40 border-b border-border">
              {shippingFree ? (
                <p className="text-xs text-accent flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {lang === "fr"
                    ? "Vous bénéficiez de la livraison offerte"
                    : "You get free shipping"}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {lang === "fr"
                    ? `Plus que ${formatPrice(remaining, lang, currency)} pour la livraison offerte`
                    : `${formatPrice(remaining, lang, currency)} away from free shipping`}
                </p>
              )}
              <div className="mt-2 h-1 w-full bg-border overflow-hidden rounded-full">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto scroll-elegant px-6 py-4">
              <ul className="flex flex-col gap-5">
                {items.map((item) => {
                  const name = lang === "fr" ? item.name : item.nameEn;
                  return (
                    <li key={item.slug} className="flex gap-4">
                      <div className="h-24 w-20 shrink-0 bg-secondary overflow-hidden">
                        <img
                          src={item.image}
                          alt={name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-sans font-medium text-base leading-tight">
                            {name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.slug)}
                            className="text-muted-foreground hover:text-destructive transition shrink-0"
                            aria-label={t.cart.remove}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground font-light mt-1">
                          {formatPrice(item.priceCents, lang, currency)}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center border border-border">
                            <button
                              onClick={() =>
                                setQty(item.slug, item.qty - 1)
                              }
                              className="h-8 w-8 flex items-center justify-center hover:bg-secondary transition"
                              aria-label="-"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-9 text-center text-sm font-sans">
                              {item.qty}
                            </span>
                            <button
                              onClick={() =>
                                setQty(item.slug, item.qty + 1)
                              }
                              className="h-8 w-8 flex items-center justify-center hover:bg-secondary transition"
                              aria-label="+"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="font-sans font-medium text-base">
                            {formatPrice(item.priceCents * item.qty, lang, currency)}
                          </span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Summary */}
            <div className="border-t border-border px-6 py-5 space-y-3 bg-background">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.cart.subtotal}</span>
                <span className="font-sans">{formatPrice(subtotal, lang, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t.cart.shipping}</span>
                <span className="font-sans">
                  {shippingFree ? (
                    <span className="text-accent">{t.cart.shippingFree}</span>
                  ) : (
                    formatPrice(shipping, lang, currency)
                  )}
                </span>
              </div>
              <div className="h-px bg-border my-1" />
              <div className="flex items-center justify-between">
                <span className="font-sans font-semibold text-lg">{t.cart.total}</span>
                <span className="font-sans font-semibold text-lg">
                  {formatPrice(total, lang, currency)}
                </span>
              </div>

              <button
                onClick={() => setCheckoutOpen(true)}
                className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-4 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors rounded-full rounded-full"
              >
                {t.cart.checkout}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCartOpen(false)}
                className="w-full text-center text-[11px] tracking-luxe-sm uppercase text-muted-foreground hover:text-foreground transition py-1"
              >
                {t.cart.continue}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
