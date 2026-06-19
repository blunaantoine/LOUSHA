"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useDict, formatPrice } from "@/lib/i18n";
import { Search, X } from "lucide-react";

interface SearchResult {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  priceCents: number;
  image: string;
}

export function SearchBar() {
  const { lang, currency, searchOpen, setSearchOpen, searchQuery, setSearchQuery, openProduct } = useStore();
  const t = useDict(lang);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { products: [] }))
        .then((d) => {
          setResults(d.products || []);
          setLoadingKey(searchQuery);
        })
        .catch(() => {
          setResults([]);
          setLoadingKey(searchQuery);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!searchOpen) return null;

  const loading = searchQuery.trim() && loadingKey !== searchQuery;

  return (
    <>
      {/* Overlay transparent pour fermer au clic */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => {
          setSearchQuery("");
          setSearchOpen(false);
        }}
      />

      {/* Dropdown de recherche */}
      <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-background border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
        {/* Champ de recherche */}
        <div className="relative p-3 border-b border-border">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-pointer" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === "fr" ? "Rechercher un produit..." : "Search products..."}
            className="w-full h-10 pl-8 pr-8 text-sm font-sans bg-secondary/50 border border-border rounded-full focus:outline-none focus:border-accent transition-colors"
          />
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchOpen(false);
            }}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Résultats */}
        <div className="max-h-80 overflow-y-auto scroll-elegant">
          {searchQuery.trim() === "" ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                {lang === "fr" ? "Tapez le nom d'un produit..." : "Type a product name..."}
              </p>
            </div>
          ) : loading ? (
            <div className="p-6 text-center">
              <span className="h-5 w-5 border-2 border-border border-t-accent rounded-full animate-spin inline-block" />
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                {lang === "fr" ? "Aucun produit trouvé." : "No products found."}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {results.map((p) => {
                const name = lang === "fr" ? p.name : p.nameEn;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      openProduct(p.slug);
                      setSearchQuery("");
                      setSearchOpen(false);
                    }}
                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-secondary/50 transition-colors text-left"
                  >
                    <img
                      src={p.image}
                      alt={name}
                      className="h-12 w-12 rounded-lg object-cover bg-secondary shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-sans font-medium text-sm truncate">{name}</p>
                      <p className="text-xs text-accent font-medium">
                        {formatPrice(p.priceCents, lang, currency)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
