/**
 * Service Administration — statistiques et gestion back-office.
 *
 * Les fonctions catalog/commandes/clients supposent que l'appelant est staff
 * (ADMIN ou MANAGER). Les fonctions de gestion utilisateurs supposent
 * que l'appelant est ADMIN (vérifié via requireAdmin dans les routes API).
 */
import { db } from "@/lib/db";
import { hashPassword } from "./auth-service";

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

/* ============ CRUD Produits ============ */

export interface ProductInput {
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  priceCents: number;
  categorySlug: string;
  image: string;
  gallery?: string;
  material: string;
  origin: string;
  craftingTime: string;
  badge?: string;
  featured?: boolean;
  inStock?: boolean;
  stock?: number;
}

export async function createProduct(input: ProductInput) {
  return db.product.create({
    data: {
      slug: input.slug,
      name: input.name,
      nameEn: input.nameEn,
      description: input.description,
      descriptionEn: input.descriptionEn,
      priceCents: input.priceCents,
      categorySlug: input.categorySlug,
      image: input.image,
      gallery: input.gallery || input.image,
      material: input.material,
      origin: input.origin,
      craftingTime: input.craftingTime,
      badge: input.badge || "none",
      featured: input.featured ?? false,
      inStock: input.inStock ?? true,
      stock: input.stock ?? 0,
    },
  });
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  return db.product.update({
    where: { id },
    data: input,
  });
}

export async function deleteProduct(id: string) {
  return db.product.delete({ where: { id } });
}

/* ============ CRUD Hero Slides ============ */

export async function listHeroSlides(activeOnly = false) {
  return db.heroSlide.findMany({
    where: activeOnly ? { active: true } : {},
    orderBy: { order: "asc" },
  });
}

export async function createHeroSlide(input: {
  image: string;
  eyebrowFr?: string;
  eyebrowEn?: string;
  titleFr: string;
  titleEn: string;
  textFr?: string;
  textEn?: string;
  order?: number;
  active?: boolean;
}) {
  return db.heroSlide.create({
    data: {
      image: input.image,
      eyebrowFr: input.eyebrowFr || "",
      eyebrowEn: input.eyebrowEn || "",
      titleFr: input.titleFr,
      titleEn: input.titleEn,
      textFr: input.textFr || "",
      textEn: input.textEn || "",
      order: input.order ?? 0,
      active: input.active ?? true,
    },
  });
}

export async function updateHeroSlide(id: string, input: Partial<{
  image: string;
  eyebrowFr: string;
  eyebrowEn: string;
  titleFr: string;
  titleEn: string;
  textFr: string;
  textEn: string;
  order: number;
  active: boolean;
}>) {
  return db.heroSlide.update({ where: { id }, data: input });
}

export async function deleteHeroSlide(id: string) {
  return db.heroSlide.delete({ where: { id } });
}

/* ============ CRUD Catégories (Collections) ============ */

export interface CategoryInput {
  slug: string;
  name: string;
  nameEn: string;
  tagline: string;
  taglineEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  order: number;
}

export async function listAllCategoriesAdmin() {
  return db.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function toggleCategoryActive(slug: string, active: boolean) {
  return db.category.update({ where: { slug }, data: { active } });
}

export async function createCategory(input: CategoryInput) {
  return db.category.create({ data: input });
}

export async function updateCategory(slug: string, input: Partial<CategoryInput>) {
  return db.category.update({ where: { slug }, data: input });
}

export async function deleteCategory(slug: string) {
  return db.category.delete({ where: { slug } });
}

/* ============ CRUD Variantes produits ============ */

export async function listVariants(productId: string) {
  return db.productVariant.findMany({
    where: { productId },
    orderBy: { order: "asc" },
  });
}

export async function createVariant(
  productId: string,
  input: {
    label: string;
    labelEn?: string;
    value: string;
    color?: string;
    priceCents: number;
    stock: number;
    sku?: string;
    image?: string;
    order?: number;
  }
) {
  return db.productVariant.create({
    data: {
      productId,
      label: input.label,
      labelEn: input.labelEn || "",
      value: input.value,
      color: input.color || null,
      priceCents: input.priceCents,
      stock: input.stock,
      sku: input.sku || null,
      image: input.image || null,
      order: input.order ?? 0,
    },
  });
}

export async function updateVariant(id: string, input: Record<string, unknown>) {
  return db.productVariant.update({ where: { id }, data: input });
}

export async function deleteVariant(id: string) {
  return db.productVariant.delete({ where: { id } });
}

/* ============ Gestion des utilisateurs (ADMIN uniquement) ============ */

export async function listAllUsers() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      blocked: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    blocked: u.blocked,
    createdAt: u.createdAt.toISOString(),
    orderCount: u._count.orders,
  }));
}

export async function createUserByAdmin(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: string; // "ADMIN" | "MANAGER" | "CUSTOMER"
}) {
  const hashed = await hashPassword(input.password);
  return db.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      password: hashed,
      phone: input.phone ?? null,
      role: input.role,
    },
    select: { id: true, name: true, email: true, role: true, blocked: true },
  });
}

export async function updateUserRole(id: string, role: string) {
  return db.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true, blocked: true },
  });
}

export async function setUserBlocked(id: string, blocked: boolean) {
  return db.user.update({
    where: { id },
    data: { blocked },
    select: { id: true, name: true, email: true, role: true, blocked: true },
  });
}

export async function deleteUser(id: string) {
  return db.user.delete({ where: { id } });
}
