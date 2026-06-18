/**
 * Service Administration — statistiques et gestion back-office.
 *
 * Toutes les fonctions supposent que l'appelant a déjà vérifié le rôle ADMIN
 * (via getServerSession dans les routes API).
 */
import { db } from "@/lib/db";

export interface AdminStats {
  // Chiffre d'affaires
  revenueToday: number; // centimes XOF
  revenueMonth: number; // centimes XOF
  // Commandes
  pendingOrders: number;
  totalOrders: number;
  // Stock
  lowStockProducts: { id: string; name: string; nameEn: string; stock: number; image: string }[];
  outOfStockCount: number;
  // Clients
  totalCustomers: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  // Bornes temporelles (aujourd'hui et ce mois-ci)
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Commandes payées (on compte PAID, SHIPPED, DELIVERED dans le CA)
  const paidStatuses = ["PAID", "SHIPPED", "DELIVERED"];

  const [todayOrders, monthOrders, pendingOrders, totalOrders, allProducts, customers] =
    await Promise.all([
      db.order.aggregate({
        _sum: { totalCents: true },
        where: {
          createdAt: { gte: startOfToday },
          status: { in: paidStatuses },
        },
      }),
      db.order.aggregate({
        _sum: { totalCents: true },
        where: {
          createdAt: { gte: startOfMonth },
          status: { in: paidStatuses },
        },
      }),
      db.order.count({ where: { status: "PENDING" } }),
      db.order.count(),
      db.product.findMany({ select: { id: true, name: true, nameEn: true, stock: true, image: true, inStock: true } }),
      db.user.count({ where: { role: "CUSTOMER" } }),
    ]);

  const lowStockProducts = allProducts
    .filter((p) => p.stock > 0 && p.stock <= 3)
    .sort((a, b) => a.stock - b.stock);
  const outOfStockCount = allProducts.filter((p) => p.stock === 0 || !p.inStock).length;

  return {
    revenueToday: todayOrders._sum.totalCents ?? 0,
    revenueMonth: monthOrders._sum.totalCents ?? 0,
    pendingOrders,
    totalOrders,
    lowStockProducts,
    outOfStockCount,
    totalCustomers: customers,
  };
}

export async function listAllOrdersAdmin() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, payment: true, user: true },
  });
}

export async function listAllProductsAdmin() {
  return db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
}

export async function listAllCustomersAdmin() {
  const users = await db.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: {
      orders: { select: { id: true, totalCents: true, status: true, createdAt: true } },
    },
  });
  // Calcule le total dépensé et le nombre de commandes par client
  return users.map((u) => {
    const paidOrders = u.orders.filter((o) =>
      ["PAID", "SHIPPED", "DELIVERED"].includes(o.status)
    );
    const totalSpent = paidOrders.reduce((sum, o) => sum + o.totalCents, 0);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      createdAt: u.createdAt.toISOString(),
      orderCount: u.orders.length,
      totalSpent,
    };
  });
}

export async function updateProductStock(id: string, stock: number) {
  return db.product.update({
    where: { id },
    data: { stock, inStock: stock > 0 },
  });
}
