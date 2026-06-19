"use client";

import { useEffect, useState, useCallback } from "react";

export interface Category {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  tagline: string;
  taglineEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  order: number;
  _count?: { products: number };
}

export interface ProductVariant {
  id: string;
  productId: string;
  label: string;
  labelEn: string;
  value: string;
  color: string | null;
  priceCents: number;
  stock: number;
  sku: string | null;
  image: string | null;
  order: number;
  active: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  priceCents: number;
  categorySlug: string;
  image: string;
  gallery: string;
  material: string;
  origin: string;
  craftingTime: string;
  badge: string;
  featured: boolean;
  inStock: boolean;
  stock: number;
  createdAt: string;
  category?: Category;
  variants?: ProductVariant[];
}

export function useCategories() {
  const [state, setState] = useState<{
    categories: Category[];
    key: number;
    error: string | null;
  }>({ categories: [], key: -1, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    fetch("/api/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (active)
          setState({
            categories: data.categories || [],
            key: version,
            error: null,
          });
      })
      .catch((e) => {
        if (active)
          setState((s) => ({ ...s, key: version, error: e.message }));
      });
    return () => {
      active = false;
    };
  }, [version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);

  return {
    categories: state.categories,
    loading: state.key !== version,
    error: state.error,
    refetch,
  };
}

export function useProducts(opts: {
  category?: string;
  featured?: boolean;
  badge?: string;
} = {}) {
  const params = new URLSearchParams();
  if (opts.category) params.set("category", opts.category);
  if (opts.featured) params.set("featured", "true");
  if (opts.badge) params.set("badge", opts.badge);
  const qs = params.toString();
  const key = qs || "all";

  const [state, setState] = useState<{
    products: Product[];
    key: string | null;
    error: string | null;
  }>({ products: [], key: null, error: null });

  useEffect(() => {
    let active = true;
    fetch(`/api/products${qs ? `?${qs}` : ""}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (active)
          setState({
            products: data.products || [],
            key,
            error: null,
          });
      })
      .catch((e) => {
        if (active) setState((s) => ({ ...s, key, error: e.message }));
      });
    return () => {
      active = false;
    };
  }, [key, qs]);

  return {
    products: state.products,
    loading: state.key !== key,
    error: state.error,
  };
}

export function useProduct(slug: string | null) {
  const key = slug ?? "";

  const [state, setState] = useState<{
    product: Product | null;
    related: Product[];
    key: string | null;
    error: string | null;
  }>({ product: null, related: [], key: null, error: null });

  useEffect(() => {
    if (!slug) {
      return;
    }
    let active = true;
    fetch(`/api/products/${slug}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => {
        if (active)
          setState({
            product: d.product,
            related: d.related || [],
            key,
            error: null,
          });
      })
      .catch((e) => {
        if (active)
          setState((s) => ({
            product: null,
            related: [],
            key,
            error: e.message,
          }));
      });
    return () => {
      active = false;
    };
  }, [key, slug]);

  const loading = !!slug && state.key !== key;
  return {
    product: state.product,
    related: state.related,
    loading,
    error: state.error,
  };
}
