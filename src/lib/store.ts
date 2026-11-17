"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Lang = "fr" | "en";
export type View =
  | "home"
  | "shop"
  | "story"
  | "material"
  | "contact"
  | "auth"
  | "forgot"
  | "reset"
  | "account"
  | "admin"
  | "product"
  | "faq"
  | "help";
export type Currency = "XOF" | "EUR" | "USD";

// Taux de change approximatifs (base XOF — Franc CFA).
// priceCents stocké en base = centimes de XOF.
export const RATES: Record<Currency, number> = {
  XOF: 1,
  EUR: 1 / 655.957, // 1 XOF = 1/655.957 EUR (taux fixe FCFA/Euro)
  USD: 1 / 600, // approximatif
};

export interface CartItem {
  slug: string;
  name: string;
  nameEn: string;
  priceCents: number;
  image: string;
  qty: number;
}

/**
 * Identifiant d'une ligne de panier. Deux variantes d'un même produit à des
 * prix différents sont deux lignes distinctes (même slug, prix différent).
 */
export const lineKey = (i: Pick<CartItem, "slug" | "priceCents">) => `${i.slug}:${i.priceCents}`;

interface StoreState {
  // Language
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;

  // Currency
  currency: Currency;
  setCurrency: (c: Currency) => void;
  cycleCurrency: () => void;

  // Navigation (client-side views, all on /)
  view: View;
  setView: (v: View) => void;

  // Quick view product (legacy modal — still used by search)
  quickViewSlug: string | null;
  setQuickView: (slug: string | null) => void;

  // Product page (full page view)
  productSlug: string | null;
  openProduct: (slug: string) => void;

  // Reset password token (passé depuis l'URL vers la vue reset)
  resetToken: string | null;
  setResetToken: (token: string | null) => void;

  // Cart drawer
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;

  // Checkout drawer
  checkoutOpen: boolean;
  /** Ouvre (ou ferme) la commande du panier entier. */
  setCheckoutOpen: (open: boolean) => void;
  /**
   * Bouton « Commander » d'un produit : commande uniquement ce produit, sans
   * toucher au panier (qui peut contenir d'anciens articles).
   */
  directItems: CartItem[] | null;
  startDirectCheckout: (item: Omit<CartItem, "qty">, qty?: number) => void;

  // Mobile menu
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;

  // Payment toggle (admin can disable)
  paymentEnabled: boolean;
  setPaymentEnabled: (enabled: boolean) => void;

  // Cart
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  /** key = lineKey(item) */
  removeFromCart: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clearCart: () => void;
  cartCount: () => number;
  cartTotal: () => number;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      lang: "fr",
      setLang: (l) => set({ lang: l }),
      toggleLang: () => set((s) => ({ lang: s.lang === "fr" ? "en" : "fr" })),

      currency: "XOF",
      setCurrency: (c) => set({ currency: c }),
      cycleCurrency: () =>
        set((s) => {
          const order: Currency[] = ["XOF", "EUR", "USD"];
          const idx = order.indexOf(s.currency);
          return { currency: order[(idx + 1) % order.length] };
        }),

      view: "home",
      setView: (v) => {
        set({ view: v, menuOpen: false });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },

      quickViewSlug: null,
      setQuickView: (slug) => set({ quickViewSlug: slug }),

      productSlug: null,
      openProduct: (slug) => {
        set({ productSlug: slug, view: "product" });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      },

      resetToken: null,
      setResetToken: (token) => set({ resetToken: token }),

      cartOpen: false,
      setCartOpen: (open) => set({ cartOpen: open }),

      checkoutOpen: false,
      setCheckoutOpen: (open) => set({ checkoutOpen: open, cartOpen: false, directItems: null }),
      directItems: null,
      startDirectCheckout: (item, qty = 1) =>
        set({ directItems: [{ ...item, qty }], checkoutOpen: true, cartOpen: false }),

      menuOpen: false,
      setMenuOpen: (open) => set({ menuOpen: open }),

      searchQuery: "",
      setSearchQuery: (q) => set({ searchQuery: q }),
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),

      // Réglage global : la vraie valeur vient du serveur (/api/settings).
      paymentEnabled: false,
      setPaymentEnabled: (enabled) => set({ paymentEnabled: enabled }),

      items: [],
      addToCart: (item, qty = 1) =>
        set((s) => {
          const key = lineKey(item);
          const existing = s.items.find((i) => lineKey(i) === key);
          if (existing) {
            return {
              items: s.items.map((i) =>
                lineKey(i) === key ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return { items: [...s.items, { ...item, qty }] };
        }),
      removeFromCart: (key) =>
        set((s) => ({ items: s.items.filter((i) => lineKey(i) !== key) })),
      setQty: (key, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            lineKey(i) === key ? { ...i, qty: Math.max(1, qty) } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      cartCount: () => get().items.reduce((n, i) => n + i.qty, 0),
      cartTotal: () =>
        get().items.reduce((n, i) => n + i.qty * i.priceCents, 0),
    }),
    {
      name: "lousha-store",
      partialize: (s) => ({ lang: s.lang, currency: s.currency, items: s.items }),
      // Ignore une ancienne valeur « paymentEnabled » restée dans le navigateur
      merge: (persisted, current) => {
        const { paymentEnabled: _ignored, ...rest } = (persisted ?? {}) as Record<string, unknown>;
        return { ...current, ...rest };
      },
    }
  )
);
