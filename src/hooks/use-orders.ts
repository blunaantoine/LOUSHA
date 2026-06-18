"use client";

import { useEffect, useState } from "react";

export interface OrderItem {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  qty: number;
}
export interface Order {
  id: string;
  email: string;
  fullName: string;
  totalCents: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

/**
 * Charge les commandes de l'utilisateur connecté.
 * Utilise le pattern à clé dérivée (lint-clean, pas de setState synchrone
 * dans un effect).
 */
export function useMyOrders(enabled: boolean) {
  const [state, setState] = useState<{
    orders: Order[];
    key: boolean | null;
  }>({ orders: [], key: null });

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    fetch("/api/orders/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((data) => {
        if (active)
          setState({ orders: data.orders || [], key: enabled });
      })
      .catch(() => {
        if (active) setState({ orders: [], key: enabled });
      });
    return () => {
      active = false;
    };
  }, [enabled]);

  return {
    orders: state.orders,
    loading: enabled && state.key !== enabled,
  };
}
