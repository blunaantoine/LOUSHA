/**
 * Service Commandes — création et lecture des commandes.
 *
 * Prépare le terrain pour le tunnel d'achat réel : quand un paiement sera
 * confirmé (PayGate/FedaPay/Stripe futur), on appellera `createOrder` pour
 * persister la commande, ses lignes et le paiement associé.
 *
 * Pour l'instant le checkout reste simulé côté client, mais cette couche
 * existe déjà pour brancher un vrai provider sans tout réécrire.
 */
import { db } from "@/lib/db";

export interface OrderLineInput {
  slug: string;
  name: string;
  priceCents: number;
  qty: number;
}

export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface CreateOrderInput {
  userId?: string | null;
  email: string;
  fullName: string;
  phone?: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  lines: OrderLineInput[];
  shippingCents: number;
  totalCents: number;
  paymentProvider?: string;
  paymentTransactionId?: string;
}

export async function createOrder(input: CreateOrderInput) {
  const order = await db.order.create({
    data: {
      userId: input.userId ?? null,
      email: input.email,
      fullName: input.fullName,
      phone: input.phone ?? null,
      address: input.address,
      city: input.city,
      zip: input.zip,
      country: input.country,
      shippingCents: input.shippingCents,
      totalCents: input.totalCents,
      status: input.paymentTransactionId ? "PAID" : "PENDING",
      items: {
        create: input.lines.map((l) => ({
          slug: l.slug,
          name: l.name,
          priceCents: l.priceCents,
          qty: l.qty,
        })),
      },
      payment: input.paymentTransactionId
        ? {
            create: {
              provider: input.paymentProvider ?? "SIMULATED",
              transactionId: input.paymentTransactionId,
              status: "SUCCESS",
            },
          }
        : undefined,
    },
    include: { items: true, payment: true },
  });
  return order;
}

export async function listOrdersByEmail(email: string) {
  return db.order.findMany({
    where: { email },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}

export async function listAllOrders() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, payment: true },
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return db.order.update({ where: { id }, data: { status } });
}
