"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useDict, formatPrice } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import {
  useAdminData,
  type AdminStats,
  type AdminOrder,
  type AdminProduct,
  type AdminCustomer,
} from "@/hooks/use-admin-data";
import { useCategories } from "@/hooks/use-catalog";
import { cn } from "@/lib/utils";
import { ProductEditor } from "./product-editor";
import { CarouselManager } from "./carousel-manager";
import { ContentManager } from "./content-manager";
import { CollectionManager } from "./collection-manager";
import { MessagesManager } from "./messages-manager";
import { NewsletterManager } from "./newsletter-manager";
import { NotificationsManager } from "./notifications-manager";
import {
  TrendingUp,
  Calendar,
  Package,
  Users,
  AlertTriangle,
  ShoppingCart,
  Boxes,
  ArrowLeft,
  Image as ImageIcon,
  Plus,
  UserCog,
  Trash2,
  Eye,
  EyeOff,
  FileText,
  LayoutGrid,
  Mail,
  Users as UsersIcon,
  Bell,
} from "lucide-react";

type Tab = "dashboard" | "orders" | "products" | "content" | "messages" | "customers" | "users";

export function AdminView() {
  const { lang, currency, setView } = useStore();
  const t = useDict(lang);
  const { user, status } = useAuth();
  const [tab, setTab] = useState<Tab>("dashboard");

  // Accès admin : ADMIN (complet) ou MANAGER (sans gestion utilisateurs)
  const isAdmin = status === "authenticated" && user?.role === "ADMIN";
  const isManager = status === "authenticated" && user?.role === "MANAGER";
  const authenticated = isAdmin || isManager;

  if (status === "loading") {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <span className="h-6 w-6 border-2 border-border border-t-accent rounded-full animate-spin" />
      </section>
    );
  }

  // Redirige si non-admin
  if (!authenticated) {
    if (typeof window !== "undefined") setTimeout(() => setView("home"), 0);
    return null;
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: t.admin.tabDashboard, icon: <TrendingUp className="h-4 w-4" /> },
    { key: "orders", label: t.admin.tabOrders, icon: <ShoppingCart className="h-4 w-4" /> },
    { key: "products", label: t.admin.tabProducts, icon: <Boxes className="h-4 w-4" /> },
    { key: "content", label: t.admin.tabContent, icon: <FileText className="h-4 w-4" /> },
    { key: "messages", label: t.admin.tabMessages, icon: <Mail className="h-4 w-4" /> },
    { key: "customers", label: t.admin.tabCustomers, icon: <Users className="h-4 w-4" /> },
    ...(isAdmin
      ? [{ key: "users" as Tab, label: t.admin.tabUsers, icon: <UserCog className="h-4 w-4" /> }]
      : []),
  ];

  return (
    <section className="py-12 sm:py-16 bg-background min-h-[60vh]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[11px] tracking-luxe uppercase text-accent mb-2">
              {t.admin.eyebrow}
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl text-foreground">
              {t.admin.title}
            </h1>
          </div>
          <button
            onClick={() => setView("account")}
            className="inline-flex items-center gap-2 border border-border text-foreground px-4 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans hover:bg-foreground hover:text-background transition-colors rounded-full"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t.admin.backToAccount}
          </button>
        </div>

        {/* Onglets */}
        <div className="flex gap-1 border-b border-border mb-8 overflow-x-auto scroll-elegant">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-3 text-[12px] tracking-luxe-sm uppercase font-sans transition-colors border-b-2 -mb-px whitespace-nowrap",
                tab === tb.key
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tb.icon}
              {tb.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {tab === "dashboard" && <DashboardTab enabled={authenticated} />}
        {tab === "orders" && <OrdersTab enabled={authenticated} />}
        {tab === "products" && <ProductsTab enabled={authenticated} />}
        {tab === "content" && (
          <SubTabs
            tabs={[
              { key: "carousel", label: t.admin.tabCarousel, icon: <ImageIcon className="h-3.5 w-3.5" /> },
              { key: "collections", label: t.admin.tabCollections, icon: <LayoutGrid className="h-3.5 w-3.5" /> },
              { key: "content", label: t.admin.tabContent, icon: <FileText className="h-3.5 w-3.5" /> },
            ]}
            panels={[
              { key: "carousel", content: <CarouselManager /> },
              { key: "collections", content: <CollectionManager /> },
              { key: "content", content: <ContentManager /> },
            ]}
          />
        )}
        {tab === "messages" && (
          <SubTabs
            tabs={[
              { key: "messages", label: t.admin.tabMessages, icon: <Mail className="h-3.5 w-3.5" /> },
              { key: "newsletter", label: t.admin.tabNewsletter, icon: <UsersIcon className="h-3.5 w-3.5" /> },
              { key: "notifications", label: t.admin.tabNotifications, icon: <Bell className="h-3.5 w-3.5" /> },
            ]}
            panels={[
              { key: "messages", content: <MessagesManager /> },
              { key: "newsletter", content: <NewsletterManager /> },
              { key: "notifications", content: <NotificationsManager /> },
            ]}
          />
        )}
        {tab === "customers" && <CustomersTab enabled={authenticated} />}
        {tab === "users" && isAdmin && <UsersTab enabled={isAdmin} />}
      </div>
    </section>
  );
}

/* ============ Sous-onglets (regroupement) ============ */
function SubTabs({
  tabs,
  panels,
}: {
  tabs: { key: string; label: string; icon: React.ReactNode }[];
  panels: { key: string; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.key);
  const panel = panels.find((p) => p.key === active);

  return (
    <div>
      {/* Sous-onglets */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            onClick={() => setActive(tb.key)}
            className={cn(
              "inline-flex items-center gap-1.5 px-4 py-2 text-[11px] tracking-luxe-sm uppercase font-sans transition-colors border-b-2 -mb-px whitespace-nowrap",
              active === tb.key
                ? "border-accent text-accent"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tb.icon}
            {tb.label}
          </button>
        ))}
      </div>
      {/* Contenu */}
      {panel?.content}
    </div>
  );
}

/* ============ Dashboard ============ */
function DashboardTab({ enabled }: { enabled: boolean }) {
  const { lang, currency } = useStore();
  const t = useDict(lang);
  const { data, loading } = useAdminData<{ stats: AdminStats }>("stats", enabled);
  const [localStats, setLocalStats] = useState<AdminStats | null>(null);

  // Recharge les stats quand le dashboard monte
  useEffect(() => {
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.stats) setLocalStats(d.stats); })
      .catch(() => {});
  }, []);

  const s = localStats ?? data?.stats;

  if (loading || !s) {
    return <SkeletonGrid count={4} />;
  }

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Calendar className="h-5 w-5" />}
          label={t.admin.revenueToday}
          value={formatPrice(s.revenueToday, lang, currency)}
          accent
        />
        <KpiCard
          icon={<TrendingUp className="h-5 w-5" />}
          label={t.admin.revenueMonth}
          value={formatPrice(s.revenueMonth, lang, currency)}
          accent
        />
        <KpiCard
          icon={<ShoppingCart className="h-5 w-5" />}
          label={t.admin.pendingOrders}
          value={String(s.pendingOrders)}
          sub={`${s.totalOrders} ${t.admin.totalOrdersLabel}`}
        />
        <KpiCard
          icon={<Users className="h-5 w-5" />}
          label={t.admin.totalCustomers}
          value={String(s.totalCustomers)}
        />
      </div>

      {/* Stock bas / rupture */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="font-serif text-xl">{t.admin.lowStock}</h3>
          </div>
          {s.lowStockProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground font-light">
              {t.admin.noLowStock}
            </p>
          ) : (
            <ul className="space-y-3 max-h-72 overflow-y-auto scroll-elegant">
              {s.lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <img
                    src={p.image}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover bg-secondary"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium truncate">
                      {lang === "fr" ? p.name : p.nameEn}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t.admin.stockLabel}: {p.stock}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] tracking-luxe-sm uppercase font-sans">
                    {t.admin.lowBadge}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {s.outOfStockCount > 0 && (
            <p className="mt-4 pt-4 border-t border-border text-sm text-destructive">
              {s.outOfStockCount} {t.admin.outOfStockLabel}
            </p>
          )}
        </div>

        {/* Aperçu commandes */}
        <div className="border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-accent" />
            <h3 className="font-serif text-xl">{t.admin.recentActivity}</h3>
          </div>
          <OrdersTab enabled={enabled} compact />
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 border",
        accent ? "bg-accent text-accent-foreground border-accent" : "bg-background border-border"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={cn(
            "h-9 w-9 rounded-full flex items-center justify-center",
            accent ? "bg-accent-foreground/15" : "bg-accent/10 text-accent"
          )}
        >
          {icon}
        </span>
      </div>
      <p
        className={cn(
          "text-[11px] tracking-luxe-sm uppercase font-sans",
          accent ? "text-accent-foreground/75" : "text-muted-foreground"
        )}
      >
        {label}
      </p>
      <p className="font-serif text-2xl sm:text-3xl mt-1">{value}</p>
      {sub && (
        <p
          className={cn(
            "text-xs font-sans mt-1",
            accent ? "text-accent-foreground/75" : "text-muted-foreground"
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ============ Commandes ============ */
const ORDER_STATUS_STYLES: Record<string, string> = {
  PENDING: "text-amber-600 bg-amber-50",
  CONFIRMED: "text-blue-600 bg-blue-50",
  PAID: "text-accent bg-accent/10",
  SHIPPED: "text-blue-600 bg-blue-50",
  DELIVERED: "text-green-700 bg-green-50",
  CANCELLED: "text-destructive bg-destructive/10",
};

function OrdersTab({ enabled, compact }: { enabled: boolean; compact?: boolean }) {
  const { lang, currency } = useStore();
  const t = useDict(lang);
  const { data, loading } = useAdminData<{ orders: AdminOrder[] }>("orders", enabled);
  const [localOrders, setLocalOrders] = useState<AdminOrder[] | null>(null);

  if (loading || !data) return compact ? <p className="text-sm text-muted-foreground">{t.common.loading}</p> : <SkeletonGrid count={3} />;
  const orders = localOrders ?? (compact ? data.orders.slice(0, 5) : data.orders);

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart className="h-6 w-6" />}
        title={t.admin.noOrders}
      />
    );
  }

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      PENDING: t.account.statusPending,
      CONFIRMED: lang === "fr" ? "Confirmée" : "Confirmed",
      PAID: t.account.statusPaid,
      SHIPPED: t.account.statusShipped,
      DELIVERED: t.account.statusDelivered,
      CANCELLED: t.account.statusCancelled,
    };
    return map[s] || s;
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    // Met à jour localement
    setLocalOrders((prev) => {
      const base = prev ?? data.orders;
      return base.map((o) => o.id === orderId ? { ...o, status: newStatus } : o);
    });
  };

  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const date = new Date(o.createdAt).toLocaleDateString(
          lang === "fr" ? "fr-FR" : "en-US",
          { day: "2-digit", month: "short", year: "numeric" }
        );
        const itemCount = o.items.reduce((n, i) => n + i.qty, 0);
        const isWhatsApp = o.payment?.provider === "WHATSAPP";
        return (
          <div
            key={o.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-border rounded-2xl hover:border-accent/40 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                <Package className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="font-sans font-medium text-sm truncate flex items-center gap-2">
                  #{o.id.slice(-6).toUpperCase()} · {o.fullName}
                  {isWhatsApp && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#25D366]/10 text-[#25D366] text-[8px] tracking-luxe-sm uppercase">WhatsApp</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {date} · {itemCount} {t.account.items}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {compact ? (
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] tracking-luxe-sm uppercase font-sans",
                    ORDER_STATUS_STYLES[o.status] || ""
                  )}
                >
                  {statusLabel(o.status)}
                </span>
              ) : (
                <select
                  value={o.status}
                  onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  className={cn(
                    "h-8 px-2 text-[10px] tracking-luxe-sm uppercase font-sans rounded-full border-0 cursor-pointer",
                    ORDER_STATUS_STYLES[o.status] || "bg-secondary"
                  )}
                >
                  <option value="PENDING">{statusLabel("PENDING")}</option>
                  <option value="CONFIRMED">{statusLabel("CONFIRMED")}</option>
                  <option value="PAID">{statusLabel("PAID")}</option>
                  <option value="SHIPPED">{statusLabel("SHIPPED")}</option>
                  <option value="DELIVERED">{statusLabel("DELIVERED")}</option>
                  <option value="CANCELLED">{statusLabel("CANCELLED")}</option>
                </select>
              )}
              <span className="font-serif text-base whitespace-nowrap">
                {formatPrice(o.totalCents, lang, currency)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============ Produits ============ */
function ProductsTab({ enabled }: { enabled: boolean }) {
  const { lang, currency } = useStore();
  const t = useDict(lang);
  const { categories } = useCategories();
  const { data, loading } = useAdminData<{ products: AdminProduct[] }>("products", enabled);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [localProducts, setLocalProducts] = useState<AdminProduct[] | null>(null);

  const products = localProducts ?? data?.products ?? [];

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (p: AdminProduct) => {
    setEditing(p);
    setEditorOpen(true);
  };
  const handleSaved = async () => {
    // Recharge les produits depuis l'API après création/modif/suppression
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      const d = await res.json();
      setLocalProducts(d.products || []);
    } catch {
      /* ignore */
    }
  };

  if (loading && !data) return <SkeletonGrid count={4} />;

  return (
    <div>
      {/* Barre d'actions */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {products.length} {products.length > 1 ? "produits" : "produit"}
        </p>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.admin.newProduct}
        </button>
      </div>

      <div className="overflow-x-auto scroll-elegant">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-border text-[10px] tracking-luxe-sm uppercase text-muted-foreground">
              <th className="py-3 pr-4 font-medium">{t.admin.colProduct}</th>
              <th className="py-3 px-4 font-medium hidden sm:table-cell">{t.admin.colCategory}</th>
              <th className="py-3 px-4 font-medium">{t.admin.colPrice}</th>
              <th className="py-3 px-4 font-medium">{t.admin.colStock}</th>
              <th className="py-3 pl-4 font-medium">{t.admin.colStatus}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                onClick={() => openEdit(p)}
                className="border-b border-border/60 hover:bg-secondary/30 transition-colors cursor-pointer"
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover bg-secondary shrink-0"
                    />
                    <span className="font-sans font-medium truncate">
                      {lang === "fr" ? p.name : p.nameEn}
                    </span>
                  </div>
                </td>
              <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground">
                {p.category ? (lang === "fr" ? p.category.name : p.category.nameEn) : "—"}
              </td>
              <td className="py-3 px-4 font-sans">
                {formatPrice(p.priceCents, lang, currency)}
              </td>
              <td className="py-3 px-4">
                <span
                  className={cn(
                    "font-sans font-medium",
                    p.stock === 0
                      ? "text-destructive"
                      : p.stock <= 3
                      ? "text-amber-600"
                      : "text-foreground"
                  )}
                >
                  {p.stock}
                </span>
              </td>
              <td className="py-3 pl-4">
                {p.inStock ? (
                  <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[10px] tracking-luxe-sm uppercase font-sans">
                    {t.admin.inStock}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] tracking-luxe-sm uppercase font-sans">
                    {t.admin.outOfStock}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Éditeur produit */}
      <ProductEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSaved={handleSaved}
        product={editing}
        categories={categories}
      />
    </div>
  );
}

/* ============ Clients ============ */
function CustomersTab({ enabled }: { enabled: boolean }) {
  const { lang, currency } = useStore();
  const t = useDict(lang);
  const { data, loading } = useAdminData<{ customers: AdminCustomer[] }>("customers", enabled);

  if (loading || !data) return <SkeletonGrid count={4} />;
  const customers = data.customers;

  if (customers.length === 0) {
    return (
      <EmptyState icon={<Users className="h-6 w-6" />} title={t.admin.noCustomers} />
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers.map((c) => {
        const date = new Date(c.createdAt).toLocaleDateString(
          lang === "fr" ? "fr-FR" : "en-US",
          { day: "2-digit", month: "short", year: "numeric" }
        );
        return (
          <div
            key={c.id}
            className="border border-border rounded-2xl p-5 hover:border-accent/40 transition-colors"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="h-11 w-11 rounded-full bg-accent/10 text-accent flex items-center justify-center font-serif text-lg shrink-0">
                {c.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="font-sans font-medium truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground truncate">{c.email}</p>
              </div>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.admin.customerSince}</span>
                <span className="font-sans">{date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.admin.customerOrders}</span>
                <span className="font-sans font-medium">{c.orderCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.admin.customerSpent}</span>
                <span className="font-serif">{formatPrice(c.totalSpent, lang, currency)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============ Helpers UI ============ */
function SkeletonGrid({ count }: { count: number }) {
  return (
    <div
      className={cn(
        "grid gap-4",
        count >= 4 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-28 bg-secondary animate-pulse rounded-2xl" />
      ))}
    </div>
  );
}

function EmptyState({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="text-center py-16 border border-dashed border-border rounded-2xl">
      <span className="inline-flex h-14 w-14 rounded-full bg-secondary text-muted-foreground items-center justify-center mb-4">
        {icon}
      </span>
      <p className="font-serif text-xl text-muted-foreground">{title}</p>
    </div>
  );
}

/* ============ Utilisateurs (ADMIN uniquement) ============ */

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  blocked: boolean;
  createdAt: string;
  orderCount: number;
}

const ROLE_STYLES: Record<string, string> = {
  ADMIN: "bg-accent text-accent-foreground",
  MANAGER: "bg-blue-50 text-blue-700",
  CUSTOMER: "bg-secondary text-foreground",
};

function UsersTab({ enabled }: { enabled: boolean }) {
  const { lang } = useStore();
  const t = useDict(lang);
  const { data, loading } = useAdminData<{ users: AdminUser[] }>("users", enabled);
  const [localUsers, setLocalUsers] = useState<AdminUser[] | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const users = localUsers ?? data?.users ?? [];

  const reload = async () => {
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const d = await res.json();
      setLocalUsers(d.users || []);
    } catch {
      /* ignore */
    }
  };

  const changeRole = async (id: string, role: string) => {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    reload();
  };

  const toggleBlock = async (u: AdminUser) => {
    await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocked: !u.blocked }),
    });
    reload();
  };

  const remove = async (u: AdminUser) => {
    if (!confirm(`Supprimer ${u.name} ?`)) return;
    await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    reload();
  };

  if (loading && !data) return <SkeletonGrid count={4} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {users.length} {users.length > 1 ? "utilisateurs" : "utilisateur"}
        </p>
        <button
          onClick={() => {
            setEditorOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.admin.newUser}
        </button>
      </div>

      {users.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" />} title={t.admin.noUsers} />
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-border rounded-2xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={cn(
                    "h-11 w-11 rounded-full flex items-center justify-center font-serif text-lg shrink-0",
                    u.blocked ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
                  )}
                >
                  {u.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="font-sans font-medium truncate flex items-center gap-2">
                    {u.name}
                    {u.blocked && (
                      <span className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[9px] tracking-luxe-sm uppercase">
                        {t.admin.blocked}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {u.email} · {u.orderCount} {t.admin.customerOrders}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Sélecteur de rôle */}
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                  className={cn(
                    "h-9 px-3 text-[10px] tracking-luxe-sm uppercase font-sans rounded-full border-0 cursor-pointer",
                    ROLE_STYLES[u.role] || "bg-secondary"
                  )}
                >
                  <option value="ADMIN">{t.auth.adminBadge}</option>
                  <option value="MANAGER">{t.admin.roleManager}</option>
                  <option value="CUSTOMER">{t.auth.customerBadge}</option>
                </select>
                {/* Bloquer/Débloquer */}
                <button
                  onClick={() => toggleBlock(u)}
                  title={u.blocked ? t.admin.unblock : t.admin.block}
                  className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  {u.blocked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                {/* Supprimer */}
                <button
                  onClick={() => remove(u)}
                  title={t.admin.delete}
                  className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editorOpen && (
        <UserEditor
          onClose={() => {
            setEditorOpen(false);
          }}
          onSaved={() => {
            setEditorOpen(false);
            reload();
          }}
        />
      )}
    </div>
  );
}

function UserEditor({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { lang } = useStore();
  const t = useDict(lang);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "CUSTOMER",
  });
  const [saving, setSaving] = useState(false);

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.email || !form.password || !form.role) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        return;
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-3xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between px-6 h-16 border-b border-border">
          <h2 className="font-serif text-xl">{t.admin.newUser}</h2>
          <button onClick={onClose} className="p-2 hover:opacity-60" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <label className="block">
            <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
              {t.auth.name} *
            </span>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full h-11 bg-background border border-border px-3 text-sm font-sans focus:outline-none focus:border-accent rounded-xl"
            />
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
              {t.auth.email} *
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full h-11 bg-background border border-border px-3 text-sm font-sans focus:outline-none focus:border-accent rounded-xl"
            />
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
              {t.auth.password} * (6+)
            </span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="w-full h-11 bg-background border border-border px-3 text-sm font-sans focus:outline-none focus:border-accent rounded-xl"
            />
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
              {t.admin.role} *
            </span>
            <select
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
              className="w-full h-11 bg-background border border-border px-3 text-sm font-sans focus:outline-none focus:border-accent rounded-xl"
            >
              <option value="CUSTOMER">{t.auth.customerBadge}</option>
              <option value="MANAGER">{t.admin.roleManager}</option>
              <option value="ADMIN">{t.auth.adminBadge}</option>
            </select>
          </label>
          <p className="text-xs text-muted-foreground">
            {t.admin.roleHelp}
          </p>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans border border-border rounded-full hover:bg-secondary"
          >
            {t.admin.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans bg-foreground text-background rounded-full hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
          >
            {saving ? "..." : t.admin.save}
          </button>
        </div>
      </div>
    </div>
  );
}
