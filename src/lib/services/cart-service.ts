/**
 * Service Panier — calculs métier (sous-total, frais de port, total, seuil).
 *
 * Le store Zustand gère l'état panier côté client ; ce service centralise
 * les règles de calcul pour pouvoir les réutiliser côté API (création de
 * commande) et côté client (affichage panier/checkout).
 *
 * Toutes les valeurs sont en centimes de XOF (Franc CFA).
 */

// Aucun frais de port n'est facturé sur le site : la livraison est convenue
// directement avec le client. Le montant payé est donc toujours la somme des
// articles, exactement comme affiché dans le panier et la commande.
// (Avant, 4 250 FCFA étaient ajoutés côté serveur sous 52 500 FCFA d'achat,
// sans jamais être affichés au client.)
export const FREE_SHIPPING_THRESHOLD_XOF_CENTS = 0;
export const SHIPPING_COST_XOF_CENTS = 0;

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
  const shippingFree = true;
  const shipping = SHIPPING_COST_XOF_CENTS;
  const total = subtotal + shipping;
  const remaining = 0;
  const progress = 100;

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
