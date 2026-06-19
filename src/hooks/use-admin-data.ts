"use client";

import { useEffect, useState } from "react";

export interface AdminStats {
  revenueToday: number;
  revenueMonth: number;
  pendingOrders: number;
  totalOrders: number;
  lowStockProducts: { id: string; name: string; nameEn: string; stock: number; image: string }[];
  outOfStockCount: number;
  totalCustomers: number;
}

export interface AdminOrder {
  id: string;
  email: string;
  fullName: string;
  totalCents: number;
  status: string;
  createdAt: string;
  items: { id: string; name: string; qty: number; priceCents: number }[];
  payment: { provider: string; status: string } | null;
}

export interface AdminProduct {
  id: string;
  name: string;
  nameEn: string;
  priceCents: number;
  stock: number;
  inStock: boolean;
  badge: string;
  category: { name: string; nameEn: string } | null;
  image: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

type Endpoint = "stats" | "orders" | "products" | "customers";

/**
 * Hook générique pour charger les données admin.
 * Échoue silencieusement si l'utilisateur n'est pas admin (403).
 */
export function useAdminData<T>(endpoint: Endpoint, enabled: boolean) {
  const [state, setState] = useState<{ data: T | null; key: boolean | null; forbidden: boolean }>({
    data: null,
    key: null,
    forbidden: false,
  });

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetch(`/api/admin/${endpoint}`, { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 403) {
          if (active) setState({ data: null, key: enabled, forbidden: true });
          return null;
        }
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((d) => {
        if (active && d) setState({ data: d, key: enabled, forbidden: false });
      })
      .catch(() => {
        if (active) setState({ data: null, key: enabled, forbidden: false });
      });
    return () => {
      active = false;
    };
  }, [endpoint, enabled]);

  return {
    data: state.data,
    loading: enabled && state.key !== enabled,
    forbidden: state.forbidden,
  };
}
