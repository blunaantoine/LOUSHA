"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus, Eye, EyeOff, Bell, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Notif {
  id: string;
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
  type: string;
  active: boolean;
  createdAt: string;
}

export function NotificationsManager() {
  const { lang } = useStore();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loadingKey, setLoadingKey] = useState<number | null>(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", titleEn: "", message: "", messageEn: "", type: "info" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/notifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { notifications: [] }))
      .then((d) => { setNotifs(d.notifications || []); setLoadingKey(1); })
      .catch(() => setLoadingKey(1));
  }, []);

  useEffect(() => { load(); }, [load]);
  const loading = loadingKey === 0;

  const handleCreate = async () => {
    if (!form.title || !form.message) { toast.error("Titre et message requis"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { toast.error("Échec"); return; }
      toast.success(lang === "fr" ? "Notification créée" : "Notification created");
      setForm({ title: "", titleEn: "", message: "", messageEn: "", type: "info" });
      setShowForm(false);
      load();
    } finally { setSaving(false); }
  };

  const handleToggle = async (id: string, active: boolean) => {
    await fetch(`/api/admin/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(lang === "fr" ? "Supprimer ?" : "Delete?")) return;
    await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" });
    toast.success(lang === "fr" ? "Supprimée" : "Deleted");
    load();
  };

  if (loading) return <div className="h-32 bg-secondary animate-pulse rounded-2xl" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{notifs.length} {lang === "fr" ? "notification(s)" : "notification(s)"}</p>
        <button onClick={() => setShowForm((s) => !s)} className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans rounded-full hover:bg-accent hover:text-accent-foreground">
          <Plus className="h-4 w-4" />
          {lang === "fr" ? "Nouvelle" : "New"}
        </button>
      </div>

      {showForm && (
        <div className="p-5 bg-background border border-border rounded-2xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder={lang === "fr" ? "Titre (FR)" : "Title (FR)"} className="h-10 bg-background border border-border px-3 text-sm rounded-lg focus:outline-none focus:border-accent" />
            <input value={form.titleEn} onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))} placeholder={lang === "fr" ? "Titre (EN)" : "Title (EN)"} className="h-10 bg-background border border-border px-3 text-sm rounded-lg focus:outline-none focus:border-accent" />
          </div>
          <textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} rows={2} placeholder={lang === "fr" ? "Message (FR)" : "Message (FR)"} className="w-full bg-background border border-border px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-accent resize-none" />
          <textarea value={form.messageEn} onChange={(e) => setForm((f) => ({ ...f, messageEn: e.target.value }))} rows={2} placeholder={lang === "fr" ? "Message (EN)" : "Message (EN)"} className="w-full bg-background border border-border px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-accent resize-none" />
          <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="h-10 bg-background border border-border px-3 text-sm rounded-lg focus:outline-none focus:border-accent">
            <option value="info">Info</option>
            <option value="promo">Promo</option>
            <option value="update">Update</option>
          </select>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-[11px] tracking-luxe-sm uppercase border border-border rounded-full hover:bg-secondary">{lang === "fr" ? "Annuler" : "Cancel"}</button>
            <button onClick={handleCreate} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] tracking-luxe-sm uppercase bg-foreground text-background rounded-full hover:bg-accent hover:text-accent-foreground disabled:opacity-60">
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}
              {lang === "fr" ? "Enregistrer" : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {notifs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-muted-foreground">{lang === "fr" ? "Aucune notification" : "No notifications"}</p>
          </div>
        ) : notifs.map((n) => (
          <div key={n.id} className={cn("flex items-center gap-4 p-4 border rounded-2xl", n.active ? "border-border" : "border-border opacity-60")}>
            <span className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", n.type === "promo" ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground")}>
              <Bell className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-sans font-medium text-sm truncate">{n.title}</p>
              <p className="text-xs text-muted-foreground truncate">{n.message}</p>
              <span className="text-[10px] text-muted-foreground mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</span>
            </div>
            <button onClick={() => handleToggle(n.id, n.active)} className={cn("h-8 w-8 rounded-full flex items-center justify-center transition-colors", n.active ? "text-muted-foreground hover:bg-secondary" : "text-amber-600")}>
              {n.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button onClick={() => handleDelete(n.id)} className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
