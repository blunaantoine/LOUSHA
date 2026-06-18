"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload, Trash2, Loader2, Plus, Pencil } from "lucide-react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";

interface Category {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  tagline: string;
  taglineEn: string;
  description: string;
  descriptionEn: string;
  image: string;
  order: number;
  _count?: { products: number };
}

export function CollectionManager() {
  const { lang } = useStore();
  const t = useDict(lang);
  const [cats, setCats] = useState<Category[]>([]);
  const [loadingKey, setLoadingKey] = useState<number | null>(0);
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/categories", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { categories: [] }))
      .then((d) => {
        setCats(d.categories || []);
        setLoadingKey((k) => (k ?? 0) + 1);
      })
      .catch(() => setLoadingKey((k) => (k ?? 0) + 1));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loading = loadingKey === 0;

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-28 bg-secondary animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {cats.length} {cats.length > 1 ? (lang === "fr" ? "collections" : "collections") : (lang === "fr" ? "collection" : "collection")}
        </p>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.admin.newCollection}
        </button>
      </div>

      <div className="space-y-3">
        {cats.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-4 p-4 border border-border rounded-2xl hover:border-accent/40 transition-colors"
          >
            <img
              src={c.image}
              alt=""
              className="h-16 w-16 rounded-xl object-cover bg-secondary shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-sans font-medium truncate">
                {lang === "fr" ? c.name : c.nameEn}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {lang === "fr" ? c.tagline : c.taglineEn}
              </p>
              {c._count && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {c._count.products} {lang === "fr" ? "produit(s)" : "product(s)"}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setEditing(c)}
                className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                title={t.admin.edit}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={async () => {
                  if (!confirm(lang === "fr" ? "Supprimer cette collection ?" : "Delete this collection?")) return;
                  await fetch(`/api/admin/categories/${c.slug}`, { method: "DELETE" });
                  toast.success(lang === "fr" ? "Collection supprimée" : "Collection deleted");
                  load();
                }}
                className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors"
                title={t.admin.delete}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(editing || creating) && (
        <CategoryEditor
          category={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function CategoryEditor({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { lang } = useStore();
  const t = useDict(lang);
  const [form, setForm] = useState({
    slug: category?.slug || "",
    name: category?.name || "",
    nameEn: category?.nameEn || "",
    tagline: category?.tagline || "",
    taglineEn: category?.taglineEn || "",
    description: category?.description || "",
    descriptionEn: category?.descriptionEn || "",
    image: category?.image || "",
    order: category?.order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const update = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      update("image", data.url);
      toast.success(lang === "fr" ? "Image téléversée" : "Image uploaded");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.slug || !form.name || !form.image) {
      toast.error(lang === "fr" ? "Slug, nom et image requis" : "Slug, name and image required");
      return;
    }
    setSaving(true);
    try {
      const url = category
        ? `/api/admin/categories/${category.slug}`
        : "/api/admin/categories";
      const method = category ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json();
        toast.error(d.error || "Échec");
        return;
      }
      toast.success(category ? "Collection modifiée" : "Collection créée");
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto scroll-elegant">
        <div className="sticky top-0 flex items-center justify-between px-6 h-16 border-b border-border bg-background z-10">
          <h2 className="font-serif text-xl">
            {category ? t.admin.editCollection : t.admin.newCollection}
          </h2>
          <button onClick={onClose} className="p-2 hover:opacity-60" aria-label="Close">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {/* Image */}
          <div>
            <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
              {t.admin.productImage}
            </span>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-xl overflow-hidden bg-secondary shrink-0">
                {form.image && <img src={form.image} alt="" className="h-full w-full object-cover" />}
              </div>
              <label className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans rounded-full cursor-pointer hover:bg-foreground hover:text-background transition-colors">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {t.admin.uploadImage}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nom (FR)" value={form.name} onChange={(v) => update("name", v)} required />
            <Field label="Nom (EN)" value={form.nameEn} onChange={(v) => update("nameEn", v)} />
            <Field label="Slug" value={form.slug} onChange={(v) => update("slug", v.toLowerCase().replace(/\s+/g, "-"))} disabled={!!category} required />
            <Field label="Ordre" type="number" value={String(form.order)} onChange={(v) => update("order", Number(v))} />
            <Field label="Slogan (FR)" value={form.tagline} onChange={(v) => update("tagline", v)} />
            <Field label="Slogan (EN)" value={form.taglineEn} onChange={(v) => update("taglineEn", v)} />
          </div>
          <Field label="Description (FR)" value={form.description} onChange={(v) => update("description", v)} textarea />
          <Field label="Description (EN)" value={form.descriptionEn} onChange={(v) => update("descriptionEn", v)} textarea />
        </div>
        <div className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 border-t border-border bg-background">
          <button onClick={onClose} className="px-5 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans border border-border rounded-full hover:bg-secondary">
            {t.admin.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans bg-foreground text-background rounded-full hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t.admin.save}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  disabled,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      {textarea ? (
        <textarea
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-background border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-accent rounded-xl resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full h-11 bg-background border border-border px-3 text-sm font-sans focus:outline-none focus:border-accent rounded-xl disabled:opacity-60"
        />
      )}
    </label>
  );
}
