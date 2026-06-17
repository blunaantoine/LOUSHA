"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, User, Globe } from "lucide-react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Header() {
  const { lang, toggleLang, setView, view, setCartOpen, cartCount } = useStore();
  const t = useDict(lang);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems: { key: "home" | "shop" | "contact"; label: string }[] = [
    { key: "home", label: t.nav.home },
    { key: "shop", label: t.nav.shop },
    { key: "contact", label: t.nav.contact },
  ];

  const count = cartCount();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-500",
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border/60 shadow-[0_1px_30px_-15px_rgba(0,0,0,0.15)]"
          : "bg-background/0"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
          {/* === Gauche : Logo (à la place du menu) + nav desktop === */}
          <div className="flex items-center gap-8 lg:gap-12">
            <button
              onClick={() => setView("home")}
              className="flex flex-col items-start group"
              aria-label="Lousha Accessories"
            >
              <span className="font-display text-2xl sm:text-3xl tracking-tight leading-none text-foreground">
                Lousha
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-luxe uppercase text-muted-foreground mt-1 font-medium">
                Accessories
              </span>
            </button>

            {/* Nav desktop (à droite du logo) */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setView(item.key)}
                  className={cn(
                    "relative text-[13px] tracking-luxe-sm uppercase font-sans transition-colors hover:text-accent",
                    view === item.key ? "text-accent" : "text-foreground/80"
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-px bg-accent transition-all duration-300",
                      view === item.key ? "w-full" : "w-0"
                    )}
                  />
                </button>
              ))}
            </nav>
          </div>

          {/* === Droite : Langue (unique) + Compte (desktop) + Panier === */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Sélecteur de langue — unique, à la place du bouton langue */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 text-[12px] tracking-luxe-sm uppercase font-sans text-foreground/80 hover:text-accent transition"
              aria-label="Change language"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang === "fr" ? "FR" : "EN"}
            </button>

            {/* Compte (desktop) */}
            <button
              className="hidden lg:block text-foreground/80 hover:text-accent transition"
              aria-label={t.nav.account}
            >
              <User className="h-[18px] w-[18px]" />
            </button>

            {/* Panier */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-1.5 text-foreground hover:opacity-60 transition"
              aria-label={t.nav.cart}
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-sans font-medium h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
