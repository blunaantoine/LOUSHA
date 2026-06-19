"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useDict, formatPrice } from "@/lib/i18n";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  priceCents: number;
  image: string;
  categorySlug: string;
}

export function SearchBar() {
  const { lang, currency, searchOpen, setSearchOpen, searchQuery, setSearchQuery, setQuickView, setView } = useStore();
  const t = useDict(lang);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Recherche en temps réel (debounce 300ms)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { products: [] }))
        .then((d) => setResults(d.products || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-md animate-fade-in">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-20">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === "fr" ? "Rechercher un produit..." : "Search for a product..."}
            className="w-full h-14 pl-12 pr-12 text-lg font-sans bg-background border border-border rounded-full focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
          />
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchOpen(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Résultats */}
        {searchQuery.trim() && (
          <div className="mt-6">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">{t.common.loading}</p>
            ) : results.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {lang === "fr" ? "Aucun produit trouvé." : "No products found."}
              </p>
            ) : (
              <>
                <p className="text-xs tracking-luxe-sm uppercase text-muted-foreground mb-4">
                  {results.length} {lang === "fr" ? "résultat(s)" : "result(s)"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto scroll-elegant pb-8">
                  {results.map((p) => {
                    const name = lang === "fr" ? p.name : p.nameEn;
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          setQuickView(p.slug);
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-4 p-3 border border-border rounded-2xl hover:border-accent/40 hover:bg-secondary/30 transition-all text-left"
                      >
                        <img
                          src={p.image}
                          alt={name}
                          className="h-16 w-16 rounded-xl object-cover bg-secondary shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-sans font-medium text-sm truncate">{name}</p>
                          <p className="text-sm text-accent font-medium mt-0.5">
                            {formatPrice(p.priceCents, lang, currency)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Suggestions quand vide */}
        {!searchQuery.trim() && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {lang === "fr"
                ? "Tapez le nom d'un produit (panier, set de table...)"
                : "Type a product name (basket, placemat...)"}
            </p>
            <button
              onClick={() => {
                setSearchOpen(false);
                setView("shop");
              }}
              className="mt-4 text-sm text-accent hover:underline"
            >
              {t.products.viewAll}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
