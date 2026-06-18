/**
 * Service Panier — calculs métier (sous-total, frais de port, total, seuil).
 *
 * Le store Zustand gère l'état panier côté client ; ce service centralise
 * les règles de calcul pour pouvoir les réutiliser côté API (création de
 * commande) et côté client (affichage panier/checkout).
 *
 * Toutes les valeurs sont en centimes de XOF (Franc CFA).
 */

// Seuil de livraison offerte : 80 € ≈ 52 500 FCFA
export const FREE_SHIPPING_THRESHOLD_XOF_CENTS = 5_250_000;
// Frais de port : ~6,50 € ≈ 4 250 FCFA
export const SHIPPING_COST_XOF_CENTS = 425_000;

export interface CartLine {
  slug: string;
  name: string;
  nameEn: string;
  priceCents: number;
  image: string;
  qty: number;
}

export interface CartTotals {
  subtotal: number;
  shipping: number;
  total: number;
  shippingFree: boolean;
  remainingForFreeShipping: number;
  freeShippingProgress: number; // 0..100
  itemCount: number;
}

export function computeCartTotals(items: CartLine[]): CartTotals {
  const subtotal = items.reduce((sum, i) => sum + i.priceCents * i.qty, 0);
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const shippingFree =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD_XOF_CENTS;
  const shipping = shippingFree ? 0 : SHIPPING_COST_XOF_CENTS;
  const total = subtotal + shipping;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD_XOF_CENTS - subtotal);
  const progress = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD_XOF_CENTS) * 100
  );

  return {
    subtotal,
    shipping,
    total,
    shippingFree,
    remainingForFreeShipping: remaining,
    freeShippingProgress: progress,
    itemCount,
  };
}
