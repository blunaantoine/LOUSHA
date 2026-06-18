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
  | "account";
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

  // Quick view product
  quickViewSlug: string | null;
  setQuickView: (slug: string | null) => void;

  // Cart drawer
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;

  // Checkout drawer
  checkoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;

  // Mobile menu
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;

  // Cart
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeFromCart: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
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

      cartOpen: false,
      setCartOpen: (open) => set({ cartOpen: open }),

      checkoutOpen: false,
      setCheckoutOpen: (open) => set({ checkoutOpen: open, cartOpen: false }),

      menuOpen: false,
      setMenuOpen: (open) => set({ menuOpen: open }),

      items: [],
      addToCart: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.slug === item.slug);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.slug === item.slug ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return { items: [...s.items, { ...item, qty }] };
        }),
      removeFromCart: (slug) =>
        set((s) => ({ items: s.items.filter((i) => i.slug !== slug) })),
      setQty: (slug, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.slug === slug ? { ...i, qty: Math.max(1, qty) } : i
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
    }
  )
);
