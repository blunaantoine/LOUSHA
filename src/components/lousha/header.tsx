"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, User, Globe, Menu, X, Search } from "lucide-react";
import { SearchBar } from "./search-bar";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { useHydrated } from "@/hooks/use-hydrated";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Header() {
  const {
    lang,
    toggleLang,
    currency,
    cycleCurrency,
    setCartOpen,
    cartCount,
    menuOpen,
    setMenuOpen,
    setSearchOpen,
  } = useStore();
  const t = useDict(lang);
  const hydrated = useHydrated();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems: { key: string; href: string; label: string }[] = [
    { key: "home", href: "/", label: t.nav.home },
    { key: "shop", href: "/shop", label: t.nav.shop },
    { key: "story", href: "/story", label: t.footer.links.story },
    { key: "material", href: "/material", label: t.footer.links.material },
    { key: "contact", href: "/contact", label: t.nav.contact },
  ];

  const count = cartCount();

  // Determine which nav item is active based on pathname
  const isActive = (key: string, href: string) => {
    if (key === "home") return pathname === "/";
    return pathname.startsWith(href);
  };

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
            <Link
              href="/"
              className="flex items-center group shrink-0"
              aria-label="Lousha Accessories — Accueil"
            >
              <img
                src="/images/lousha-logo.png"
                alt="Lousha Accessories"
                className="h-12 sm:h-16 w-auto object-contain"
              />
            </Link>

            {/* === Centre : Nav desktop === */}
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "relative text-[13px] tracking-luxe-sm uppercase font-sans transition-colors hover:text-accent",
                    isActive(item.key, item.href) ? "text-accent" : "text-foreground/80"
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-px bg-accent transition-all duration-300",
                      isActive(item.key, item.href) ? "w-full" : "w-0"
                    )}
                  />
                </Link>
              ))}
            </nav>

            {/* === Droite : Menu mobile + Panier === */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Menu hamburger — mobile uniquement (contient nav + langue + devise + compte) */}
              <button
                onClick={() => setMenuOpen(true)}
                className="lg:hidden p-1.5 text-foreground hover:opacity-60 transition"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Langue (desktop) */}
              <button
                onClick={toggleLang}
                className="hidden lg:flex items-center gap-1.5 text-[12px] tracking-luxe-sm uppercase font-sans text-foreground/80 hover:text-accent transition"
                aria-label="Change language"
              >
                <Globe className="h-3.5 w-3.5" />
                {hydrated ? (lang === "fr" ? "FR" : "EN") : "FR"}
              </button>

              {/* Devise (desktop) */}
              <button
                onClick={cycleCurrency}
                className="hidden lg:flex items-center gap-1.5 text-[12px] tracking-luxe-sm uppercase font-sans text-foreground/80 hover:text-accent transition px-2.5 py-1 rounded-full border border-border hover:border-accent"
                aria-label="Change currency"
                title="Changer de devise"
              >
                {hydrated ? currency : "XOF"}
              </button>

              {/* Compte (desktop) */}
              <AccountButton />

              {/* Recherche — dropdown sous l'icône */}
              <div className="relative">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-1.5 text-foreground hover:opacity-60 transition"
                  aria-label={lang === "fr" ? "Rechercher" : "Search"}
                >
                  <Search className="h-5 w-5" />
                </button>
                <SearchBar />
              </div>

              {/* Panier — toujours visible */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-1.5 text-foreground hover:opacity-60 transition"
                aria-label={t.nav.cart}
              >
                <ShoppingBag className="h-5 w-5" />
                {hydrated && count > 0 && (
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
              className="h-11 w-auto object-contain"
            />
            <button onClick={() => setMenuOpen(false)} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex flex-col px-6 py-6 gap-1">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "text-left text-2xl font-serif py-3 border-b border-border/60 transition-colors hover:text-accent",
                  isActive(item.key, item.href) ? "text-accent" : "text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Recherche mobile */}
          <div className="px-6 pb-4">
            <button
              onClick={() => {
                setMenuOpen(false);
                setSearchOpen(true);
              }}
              className="flex items-center gap-2 w-full p-3 border border-border rounded-full text-muted-foreground hover:bg-secondary transition-colors"
            >
              <Search className="h-4 w-4" />
              <span className="text-sm">{lang === "fr" ? "Rechercher..." : "Search..."}</span>
            </button>
          </div>

          {/* Langue + Devise + Compte (mobile) */}
          <div className="mt-auto px-6 py-6 border-t border-border space-y-4">
            {/* Langue + Devise */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 text-sm tracking-luxe-sm uppercase font-sans text-foreground/80"
              >
                <Globe className="h-4 w-4" />
                {hydrated ? (lang === "fr" ? "Français" : "English") : "Français"}
              </button>
              <span className="text-border">|</span>
              <button
                onClick={cycleCurrency}
                className="text-sm tracking-luxe-sm uppercase font-sans text-foreground/80 px-3 py-1.5 rounded-full border border-border"
              >
                {hydrated ? currency : "XOF"}
              </button>
            </div>

            {/* Compte */}
            <MobileAccountButton />
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Bouton compte : icône utilisateur si déconnecté (→ auth),
 * initiale si connecté (→ account).
 * Affiche un mini-spinner pendant le chargement de la session.
 */
function AccountButton() {
  const router = useRouter();
  const { status, user } = useAuth();

  if (status === "loading") {
    return (
      <span className="flex h-9 w-9 items-center justify-center">
        <span className="h-4 w-4 border-2 border-border border-t-accent rounded-full animate-spin" />
      </span>
    );
  }

  if (status === "authenticated" && user) {
    return (
      <button
        onClick={() => router.push("/account")}
        className="flex h-9 w-9 rounded-full bg-accent/10 text-accent items-center justify-center font-sans font-semibold text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label="Mon compte"
        title={user.name ?? "Mon compte"}
      >
        {user.name?.charAt(0).toUpperCase() ?? "L"}
      </button>
    );
  }

  return (
    <button
      onClick={() => router.push("/auth/login")}
      className="p-1.5 text-foreground/80 hover:text-accent transition"
      aria-label="Connexion"
    >
      <User className="h-5 w-5" />
    </button>
  );
}

/**
 * Bouton compte mobile (texte au lieu d'icône, dans le drawer).
 */
function MobileAccountButton() {
  const router = useRouter();
  const { setMenuOpen, lang } = useStore();
  const t = useDict(lang);
  const { status, user } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
          <span className="h-4 w-4 border-2 border-border border-t-accent rounded-full animate-spin" />
        </span>
      </div>
    );
  }

  if (status === "authenticated" && user) {
    return (
      <button
        onClick={() => {
          router.push("/account");
          setMenuOpen(false);
        }}
        className="flex items-center gap-3 w-full text-left"
      >
        <span className="h-10 w-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-sans font-semibold text-sm">
          {user.name?.charAt(0).toUpperCase() ?? "L"}
        </span>
        <div>
          <p className="text-sm font-sans font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{t.nav.account}</p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        router.push("/auth/login");
        setMenuOpen(false);
      }}
      className="flex items-center gap-3 w-full text-left"
    >
      <span className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
        <User className="h-5 w-5 text-muted-foreground" />
      </span>
      <div>
        <p className="text-sm font-sans font-medium">{t.auth.loginTab}</p>
        <p className="text-xs text-muted-foreground">{t.auth.noAccount}</p>
      </div>
    </button>
  );
}
