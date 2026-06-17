"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, User, Globe, Menu, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Header() {
  const { lang, toggleLang, setView, view, setCartOpen, cartCount, menuOpen, setMenuOpen } =
    useStore();
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
    <>
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
            {/* === Gauche : Logo image (clic → accueil) === */}
            <button
              onClick={() => setView("home")}
              className="flex items-center group shrink-0"
              aria-label="Lousha Accessories — Accueil"
            >
              <img
                src="/images/lousha-logo.png"
                alt="Lousha Accessories"
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </button>

            {/* === Centre : Nav desktop === */}
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

            {/* === Droite : Menu mobile + Langue + Compte + Panier === */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Menu hamburger — mobile uniquement */}
              <button
                onClick={() => setMenuOpen(true)}
                className="lg:hidden p-1.5 text-foreground hover:opacity-60 transition"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Sélecteur de langue — unique */}
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 text-[12px] tracking-luxe-sm uppercase font-sans text-foreground/80 hover:text-accent transition"
                aria-label="Change language"
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{lang === "fr" ? "FR" : "EN"}</span>
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

      {/* === Drawer menu mobile === */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-all duration-300",
          menuOpen ? "visible" : "invisible"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity",
            menuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={cn(
            "absolute right-0 top-0 h-full w-[82%] max-w-sm bg-background shadow-2xl flex flex-col transition-transform duration-300",
            menuOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between px-6 h-16 border-b border-border">
            <img
              src="/images/lousha-logo.png"
              alt="Lousha Accessories"
              className="h-8 w-auto object-contain"
            />
            <button onClick={() => setMenuOpen(false)} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col px-6 py-6 gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={cn(
                  "text-left text-2xl font-serif py-3 border-b border-border/60 transition-colors hover:text-accent",
                  view === item.key ? "text-accent" : "text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => setView("story")}
              className="text-left text-2xl font-serif py-3 border-b border-border/60 text-foreground hover:text-accent transition"
            >
              {t.footer.links.story}
            </button>
            <button
              onClick={() => setView("material")}
              className="text-left text-2xl font-serif py-3 border-b border-border/60 text-foreground hover:text-accent transition"
            >
              {t.footer.links.material}
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
