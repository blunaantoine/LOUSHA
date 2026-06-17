"use client";

import { useEffect, useState } from "react";
import { Menu, ShoppingBag, Search, User, X, Globe } from "lucide-react";
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
            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden -ml-2 p-2 text-foreground hover:opacity-60 transition"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Left nav (desktop) */}
            <nav className="hidden lg:flex items-center gap-8 flex-1">
              {navItems.slice(0, 2).map((item) => (
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

            {/* Logo center */}
            <button
              onClick={() => setView("home")}
              className="flex flex-col items-center group"
              aria-label="Lousha Accessories"
            >
              <span className="font-sans font-bold text-2xl sm:text-3xl tracking-tight leading-none text-foreground uppercase">
                Lousha
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-luxe uppercase text-muted-foreground mt-1 font-medium">
                Accessories
              </span>
            </button>

            {/* Right nav (desktop) + actions */}
            <div className="hidden lg:flex items-center gap-8 flex-1 justify-end">
              <button
                onClick={() => setView("contact")}
                className={cn(
                  "relative text-[13px] tracking-luxe-sm uppercase font-sans transition-colors hover:text-accent",
                  view === "contact" ? "text-accent" : "text-foreground/80"
                )}
              >
                {t.nav.contact}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 h-px bg-accent transition-all duration-300",
                    view === "contact" ? "w-full" : "w-0"
                  )}
                />
              </button>

              {/* Language */}
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 text-[12px] tracking-luxe-sm uppercase font-sans text-foreground/80 hover:text-accent transition"
                aria-label="Change language"
              >
                <Globe className="h-3.5 w-3.5" />
                {lang === "fr" ? "FR" : "EN"}
              </button>

              {/* Account */}
              <button
                className="text-foreground/80 hover:text-accent transition"
                aria-label={t.nav.account}
              >
                <User className="h-[18px] w-[18px]" />
              </button>
            </div>

            {/* Mobile actions */}
            <div className="flex lg:hidden items-center gap-1">
              <button
                onClick={toggleLang}
                className="px-2 py-2 text-[11px] tracking-luxe-sm uppercase font-sans text-foreground/80"
                aria-label="Language"
              >
                {lang === "fr" ? "FR" : "EN"}
              </button>
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-foreground hover:opacity-60 transition"
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

        {/* Desktop cart button - floating top right */}
        <button
          onClick={() => setCartOpen(true)}
          className="hidden lg:flex fixed top-20 right-4 z-30 items-center gap-2 bg-background/90 backdrop-blur border border-border rounded-full pl-3 pr-4 py-2 shadow-sm hover:shadow-md hover:border-accent/50 transition group"
          aria-label={t.nav.cart}
        >
          <span className="relative">
            <ShoppingBag className="h-[18px] w-[18px] text-foreground" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-sans font-medium h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </span>
          <span className="text-[12px] tracking-luxe-sm uppercase font-sans text-foreground/80 group-hover:text-accent transition">
            {t.nav.cart}
          </span>
        </button>
      </header>

      {/* Mobile menu drawer */}
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
            "absolute left-0 top-0 h-full w-[82%] max-w-sm bg-background shadow-2xl flex flex-col transition-transform duration-300",
            menuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between px-6 h-16 border-b border-border">
            <span className="font-serif text-xl tracking-[0.18em]">LOUSHA</span>
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
              onClick={() => {
                setView("story");
              }}
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
          <div className="mt-auto px-6 py-6 border-t border-border">
            <button
              onClick={toggleLang}
              className="flex items-center gap-2 text-sm tracking-luxe-sm uppercase"
            >
              <Globe className="h-4 w-4" />
              {lang === "fr" ? "Français" : "English"} ·{" "}
              <span className="text-accent">{lang.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
