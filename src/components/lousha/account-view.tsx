"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useDict, formatPrice } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useMyOrders } from "@/hooks/use-orders";
import { ArrowRight, LogOut, Package, LayoutDashboard, Pencil, Lock, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "text-amber-600 bg-amber-50",
  PAID: "text-accent bg-accent/10",
  SHIPPED: "text-blue-600 bg-blue-50",
  DELIVERED: "text-green-700 bg-green-50",
  CANCELLED: "text-destructive bg-destructive/10",
};

export function AccountView() {
  const { lang, currency, setView } = useStore();
  const t = useDict(lang);
  const { user, logout, status } = useAuth();

  // Redirige vers auth si non connecté (une fois le statut résolu)
  const authenticated = status === "authenticated" && !!user;
  const { orders, loading } = useMyOrders(authenticated);

  if (status === "loading") {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <span className="h-6 w-6 border-2 border-border border-t-accent rounded-full animate-spin" />
      </section>
    );
  }

  if (!authenticated) {
    // Effet de bord : bascule vers la vue auth
    if (typeof window !== "undefined") {
      setTimeout(() => setView("auth"), 0);
    }
    return null;
  }

  const statusLabel = (s: string) => {
    switch (s) {
      case "PENDING":
        return t.account.statusPending;
      case "PAID":
        return t.account.statusPaid;
      case "SHIPPED":
        return t.account.statusShipped;
      case "DELIVERED":
        return t.account.statusDelivered;
      default:
        return t.account.statusCancelled;
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-background min-h-[60vh]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header profil */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-12 pb-8 border-b border-border">
          <div className="flex items-center gap-4">
            <span className="h-16 w-16 rounded-full bg-accent/10 text-accent flex items-center justify-center font-serif text-2xl">
              {user!.name?.charAt(0).toUpperCase() ?? "L"}
            </span>
            <div>
              <p className="text-[11px] tracking-luxe uppercase text-muted-foreground">
                {t.account.welcome}
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl text-foreground">
                {user!.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {user!.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "px-3 py-1.5 rounded-full text-[10px] tracking-luxe-sm uppercase font-sans",
                user!.role === "ADMIN"
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-foreground"
              )}
            >
              {user!.role === "ADMIN"
                ? t.auth.adminBadge
                : t.auth.customerBadge}
            </span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 border border-border text-foreground px-4 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans hover:bg-foreground hover:text-background transition-colors rounded-full"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t.account.logout}
            </button>
          </div>
        </div>

        {/* === Modifier mes informations === */}
        <ProfileEditor />

        {/* === Changer le mot de passe === */}
        <PasswordChanger />

        {/* Lien tableau de bord admin (ADMIN ou MANAGER) */}
        {(user!.role === "ADMIN" || user!.role === "MANAGER") && (
          <button
            onClick={() => setView("admin")}
            className="group mb-10 w-full flex items-center justify-between gap-3 p-5 bg-accent text-accent-foreground rounded-2xl hover:bg-accent/90 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-accent-foreground/15 flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5" />
              </span>
              <div className="text-left">
                <p className="font-serif text-lg">{t.account.adminPanel}</p>
                <p className="text-xs text-accent-foreground/75">
                  {t.admin.eyebrow}
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        )}

        {/* Commandes */}
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-foreground mb-6">
            {t.account.myOrders}
          </h2>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-secondary animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl">
              <span className="inline-flex h-14 w-14 rounded-full bg-secondary text-muted-foreground items-center justify-center mb-4">
                <Package className="h-6 w-6" strokeWidth={1.5} />
              </span>
              <p className="font-serif text-xl text-muted-foreground mb-4">
                {t.account.noOrders}
              </p>
              <button
                onClick={() => setView("shop")}
                className="group inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors rounded-full"
              >
                {t.account.noOrdersCta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const date = new Date(order.createdAt).toLocaleDateString(
                  lang === "fr" ? "fr-FR" : "en-US",
                  { day: "2-digit", month: "short", year: "numeric" }
                );
                const itemCount = order.items.reduce((n, i) => n + i.qty, 0);
                return (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-border rounded-2xl hover:border-accent/40 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                        <Package className="h-5 w-5" strokeWidth={1.5} />
                      </span>
                      <div>
                        <p className="font-sans font-medium text-foreground">
                          {t.account.orderNumber} #{order.id.slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {date} · {itemCount} {t.account.items}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] tracking-luxe-sm uppercase font-sans",
                          STATUS_STYLES[order.status] || ""
                        )}
                      >
                        {statusLabel(order.status)}
                      </span>
                      <span className="font-serif text-lg text-foreground whitespace-nowrap">
                        {formatPrice(order.totalCents, lang, currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============ Éditeur de profil ============ */
function ProfileEditor() {
  const { lang } = useStore();
  const t = useDict(lang);
  const { user, status } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

  if (status !== "authenticated" || !user) return null;

  const handleOpen = () => {
    setForm({ name: user.name || "", email: user.email || "", phone: "" });
    setOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Échec");
        return;
      }
      toast.success(lang === "fr" ? "Profil mis à jour" : "Profile updated");
      setOpen(false);
      // Recharge la page pour mettre à jour la session
      setTimeout(() => window.location.reload(), 500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-6 border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-lg flex items-center gap-2">
          <Pencil className="h-4 w-4 text-accent" />
          {lang === "fr" ? "Mes informations" : "My information"}
        </h3>
        <button
          onClick={handleOpen}
          className="text-[11px] tracking-luxe-sm uppercase text-accent hover:underline"
        >
          {lang === "fr" ? "Modifier" : "Edit"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-[10px] tracking-luxe-sm uppercase text-muted-foreground">{lang === "fr" ? "Nom" : "Name"}</p>
          <p className="font-sans">{user.name}</p>
        </div>
        <div>
          <p className="text-[10px] tracking-luxe-sm uppercase text-muted-foreground">{t.account.emailLabel}</p>
          <p className="font-sans truncate">{user.email}</p>
        </div>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <label className="block">
            <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1">{lang === "fr" ? "Nom" : "Name"}</span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full h-11 bg-background border border-border px-3 text-sm rounded-xl focus:outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1">{t.account.emailLabel}</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full h-11 bg-background border border-border px-3 text-sm rounded-xl focus:outline-none focus:border-accent"
            />
          </label>
          <label className="block">
            <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1">{lang === "fr" ? "Téléphone" : "Phone"}</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full h-11 bg-background border border-border px-3 text-sm rounded-xl focus:outline-none focus:border-accent"
              placeholder="+228 ..."
            />
          </label>
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)} className="px-4 py-2 text-[11px] tracking-luxe-sm uppercase border border-border rounded-full hover:bg-secondary">
              {t.admin.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] tracking-luxe-sm uppercase bg-foreground text-background rounded-full hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              {t.admin.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============ Changement de mot de passe ============ */
function PasswordChanger() {
  const { lang } = useStore();
  const t = useDict(lang);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (form.newPassword !== form.confirmPassword) {
      toast.error(lang === "fr" ? "Les mots de passe ne correspondent pas" : "Passwords don't match");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Échec");
        return;
      }
      toast.success(lang === "fr" ? "Mot de passe modifié" : "Password changed");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-6 border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-serif text-lg flex items-center gap-2">
          <Lock className="h-4 w-4 text-accent" />
          {lang === "fr" ? "Mot de passe" : "Password"}
        </h3>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-[11px] tracking-luxe-sm uppercase text-accent hover:underline"
        >
          {lang === "fr" ? "Changer" : "Change"}
        </button>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <label className="block">
            <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1">{lang === "fr" ? "Mot de passe actuel" : "Current password"}</span>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
              className="w-full h-11 bg-background border border-border px-3 text-sm rounded-xl focus:outline-none focus:border-accent"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1">{lang === "fr" ? "Nouveau" : "New"}</span>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                className="w-full h-11 bg-background border border-border px-3 text-sm rounded-xl focus:outline-none focus:border-accent"
              />
            </label>
            <label className="block">
              <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1">{lang === "fr" ? "Confirmer" : "Confirm"}</span>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                className="w-full h-11 bg-background border border-border px-3 text-sm rounded-xl focus:outline-none focus:border-accent"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setOpen(false)} className="px-4 py-2 text-[11px] tracking-luxe-sm uppercase border border-border rounded-full hover:bg-secondary">
              {t.admin.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.currentPassword || !form.newPassword}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] tracking-luxe-sm uppercase bg-foreground text-background rounded-full hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              {t.admin.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
