"use client";

import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { X, Upload, Loader2, Plus, Trash2, Sparkles } from "lucide-react";
import type { AdminProduct } from "@/hooks/use-admin-data";
import type { Category } from "@/hooks/use-catalog";
import { useStore } from "@/lib/store";
import { useDict, formatPrice } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface ProductEditorProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  product: AdminProduct | null; // null = création
  categories: Category[];
}

const EMPTY = {
  slug: "",
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  priceCents: 0,
  categorySlug: "",
  image: "",
  material: "Raphia 100% naturel",
  origin: "Togo",
  craftingTime: "1 jour",
  badge: "none",
  featured: false,
  inStock: true,
  stock: 0,
};

export function ProductEditor({
  open,
  onClose,
  onSaved,
  product,
  categories,
}: ProductEditorProps) {
  const { lang } = useStore();
  const t = useDict(lang);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        slug: product.slug || "",
        name: product.name,
        nameEn: product.nameEn,
        description: "",
        descriptionEn: "",
        priceCents: product.priceCents,
        categorySlug: product.category?.slug || categories[0]?.slug || "",
        image: product.image,
        material: "Raphia 100% naturel",
        origin: "Togo",
        craftingTime: "1 jour",
        badge: product.badge,
        featured: false,
        inStock: product.inStock,
        stock: product.stock,
      });
    } else {
      setForm({ ...EMPTY, categorySlug: categories[0]?.slug || "" });
    }
  }, [product, categories, open]);

  const update = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Upload échoué");
        return;
      }
      update("image", data.url);
      toast.success(lang === "fr" ? "Image téléversée" : "Image uploaded");

      // Auto-génération IA après upload (silencieux si indisponible)
      handleAIGenerate(data.url).catch(() => {});
    } catch {
      toast.error("Upload impossible");
    } finally {
      setUploading(false);
    }
  };

  const [aiLoading, setAiLoading] = useState(false);

  const handleAIGenerate = async (imageUrl?: string) => {
    const url = imageUrl || form.image;
    if (!url) {
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/admin/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: url }),
      });
      const data = await res.json();
      if (!res.ok) {
        // IA indisponible — message discret, pas d'erreur bloquante
        toast(lang === "fr" ? "IA indisponible sur ce serveur. Remplissez manuellement." : "AI unavailable. Fill manually.");
        return;
      }
      const g = data.generated;
      if (!form.name && g.name) update("name", g.name);
      if (!form.nameEn && g.nameEn) update("nameEn", g.nameEn);
      if (!form.slug && g.slug) update("slug", g.slug);
      if (!form.material && g.material) update("material", g.material);
      if (!form.craftingTime && g.craftingTime) update("craftingTime", g.craftingTime);
      toast.success(lang === "fr" ? "✨ Contenu généré par IA" : "✨ AI content generated");
    } catch {
      // Erreur réseau — silencieux
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.slug || !form.priceCents || !form.categorySlug || !form.image) {
      toast.error("Remplis les champs requis (slug, nom, prix, catégorie, image).");
      return;
    }
    setSaving(true);
    try {
      const url = product
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";
      const method = product ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Échec");
        return;
      }
      toast.success(product ? "Produit modifié" : "Produit créé");
      onSaved();
      onClose();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!confirm("Supprimer ce produit ?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Suppression échouée");
        return;
      }
      toast.success("Produit supprimé");
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-background gap-0 rounded-3xl max-h-[92vh] overflow-y-auto scroll-elegant">
        <DialogTitle className="sr-only">
          {product ? "Modifier le produit" : "Nouveau produit"}
        </DialogTitle>
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 h-16 border-b border-border bg-background">
          <h2 className="font-serif text-xl">
            {product ? t.admin.editProduct : t.admin.newProduct}
          </h2>
          <button onClick={onClose} aria-label="Close" className="p-2 hover:opacity-60">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Image */}
          <div>
            <Label>{t.admin.productImage}</Label>
            <div className="flex items-center gap-4 mt-1.5">
              <div className="h-20 w-20 rounded-xl overflow-hidden bg-secondary shrink-0">
                {form.image ? (
                  <img src={form.image} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <label className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans rounded-full cursor-pointer hover:bg-foreground hover:text-background transition-colors">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {t.admin.uploadImage}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                  }}
                />
              </label>
              {/* Bouton génération IA */}
              {form.image && (
                <button
                  onClick={() => handleAIGenerate()}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans rounded-full hover:bg-accent/90 transition-colors disabled:opacity-60"
                  title={lang === "fr" ? "Générer le contenu avec l'IA" : "Generate content with AI"}
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {lang === "fr" ? "Générer IA" : "AI Generate"}
                </button>
              )}
            </div>
            {aiLoading && (
              <p className="text-xs text-accent mt-2 animate-pulse">
                {lang === "fr" ? "✨ L'IA analyse l'image..." : "✨ AI analyzing image..."}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={`${t.admin.colProduct} (FR)`} value={form.name} onChange={(v) => update("name", v)} required />
            <Input label={`${t.admin.colProduct} (EN)`} value={form.nameEn} onChange={(v) => update("nameEn", v)} required />
            <Input label="Slug" value={form.slug} onChange={(v) => update("slug", v.toLowerCase().replace(/\s+/g, "-"))} required />
            <Select
              label={t.admin.colCategory}
              value={form.categorySlug}
              onChange={(v) => update("categorySlug", v)}
              options={categories.map((c) => ({ value: c.slug, label: lang === "fr" ? c.name : c.nameEn }))}
              required
            />
            <Input
              label={`${t.admin.colPrice} (XOF)`}
              type="number"
              value={String(form.priceCents)}
              onChange={(v) => update("priceCents", Number(v))}
              required
            />
            <Input
              label={t.admin.colStock}
              type="number"
              value={String(form.stock)}
              onChange={(v) => update("stock", Number(v))}
            />
            <Select
              label="Badge"
              value={form.badge}
              onChange={(v) => update("badge", v)}
              options={[
                { value: "none", label: "Aucun" },
                { value: "new", label: t.products.new },
                { value: "bestseller", label: t.products.bestseller },
              ]}
            />
            <div className="flex items-end gap-4 pb-2">
              <Toggle label="Featured" checked={form.featured} onChange={(v) => update("featured", v)} />
              <Toggle label={t.admin.inStock} checked={form.inStock} onChange={(v) => update("inStock", v)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label={t.product.material} value={form.material} onChange={(v) => update("material", v)} />
            <Input label={t.product.origin} value={form.origin} onChange={(v) => update("origin", v)} />
          </div>

          {form.priceCents > 0 && (
            <p className="text-sm text-muted-foreground">
              Aperçu prix : {formatPrice(form.priceCents, lang, "XOF")}
            </p>
          )}
        </div>

        {/* === Section Variantes (édition uniquement) === */}
        {product && (
          <VariantManager productId={product.id} />
        )}

        <div className="sticky bottom-0 flex items-center justify-between gap-3 px-6 py-4 border-t border-border bg-background">
          {product ? (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="text-destructive text-[11px] tracking-luxe-sm uppercase font-sans hover:underline"
            >
              {t.admin.delete}
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans border border-border rounded-full hover:bg-secondary transition-colors"
            >
              {t.admin.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans bg-foreground text-background rounded-full hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {t.admin.save}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground">
      {children}
    </span>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <Label>
        {label}
        {required && <span className="text-accent"> *</span>}
      </Label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full h-11 bg-background border border-border px-3 text-sm font-sans focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors rounded-xl"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <Label>
        {label}
        {required && <span className="text-accent"> *</span>}
      </Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full h-11 bg-background border border-border px-3 text-sm font-sans focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors rounded-xl"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-border"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </button>
      <span className="text-[11px] tracking-luxe-sm uppercase text-muted-foreground">
        {label}
      </span>
    </label>
  );
}

/* ============ Gestionnaire de Variantes ============ */

interface Variant {
  id: string;
  label: string;
  labelEn: string;
  value: string;
  color: string | null;
  priceCents: number;
  stock: number;
  image: string | null;
  order: number;
}

function VariantManager({ productId }: { productId: string }) {
  const { lang, currency } = useStore();
  const t = useDict(lang);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    label: "",
    labelEn: "",
    value: "",
    color: "",
    priceCents: 0,
    stock: 0,
    image: "",
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/products/${productId}/variants`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { variants: [] }))
      .then((d) => setVariants(d.variants || []))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!newVariant.label || !newVariant.value) {
      toast.error(lang === "fr" ? "Libellé et valeur requis" : "Label and value required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVariant),
      });
      if (!res.ok) {
        toast.error("Échec");
        return;
      }
      toast.success(lang === "fr" ? "Variante créée" : "Variant created");
      setNewVariant({ label: "", labelEn: "", value: "", color: "", priceCents: 0, stock: 0, image: "" });
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(lang === "fr" ? "Supprimer cette variante ?" : "Delete this variant?")) return;
    await fetch(`/api/admin/variants/${id}`, { method: "DELETE" });
    toast.success(lang === "fr" ? "Variante supprimée" : "Variant deleted");
    load();
  };

  return (
    <div className="border-t border-border px-6 py-5 bg-secondary/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg">{t.product.variants}</h3>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-1.5 text-[11px] tracking-luxe-sm uppercase font-sans text-accent hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          {lang === "fr" ? "Ajouter" : "Add"}
        </button>
      </div>

      {/* Liste des variantes */}
      {loading ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : variants.length === 0 && !showForm ? (
        <p className="text-sm text-muted-foreground">
          {lang === "fr"
            ? "Aucune variante. Le produit sera vendu dans sa version standard."
            : "No variants. Product will be sold in its standard version."}
        </p>
      ) : (
        <div className="space-y-2">
          {variants.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl"
            >
              {v.image && (
                <img src={v.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-sans font-medium truncate">{v.label}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(v.priceCents, lang, currency)} · {lang === "fr" ? "Stock" : "Stock"}: {v.stock}
                </p>
              </div>
              <button
                onClick={() => handleDelete(v.id)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire nouvelle variante */}
      {showForm && (
        <div className="mt-3 p-4 bg-background border border-border rounded-xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1">
                {lang === "fr" ? "Libellé (FR)" : "Label (FR)"} *
              </span>
              <input
                value={newVariant.label}
                onChange={(e) => setNewVariant((v) => ({ ...v, label: e.target.value }))}
                className="w-full h-10 bg-background border border-border px-3 text-sm rounded-lg focus:outline-none focus:border-accent"
                placeholder="Grand"
              />
            </label>
            <label className="block">
              <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1">
                {lang === "fr" ? "Libellé (EN)" : "Label (EN)"}
              </span>
              <input
                value={newVariant.labelEn}
                onChange={(e) => setNewVariant((v) => ({ ...v, labelEn: e.target.value }))}
                className="w-full h-10 bg-background border border-border px-3 text-sm rounded-lg focus:outline-none focus:border-accent"
                placeholder="Large"
              />
            </label>
            <label className="block">
              <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1">
                {lang === "fr" ? "Valeur (slug)" : "Value (slug)"} *
              </span>
              <input
                value={newVariant.value}
                onChange={(e) => setNewVariant((v) => ({ ...v, value: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                className="w-full h-10 bg-background border border-border px-3 text-sm rounded-lg focus:outline-none focus:border-accent"
                placeholder="grand"
              />
            </label>
            <label className="block">
              <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1">
                {lang === "fr" ? "Prix (XOF)" : "Price (XOF)"}
              </span>
              <input
                type="number"
                value={String(newVariant.priceCents)}
                onChange={(e) => setNewVariant((v) => ({ ...v, priceCents: Number(e.target.value) }))}
                className="w-full h-10 bg-background border border-border px-3 text-sm rounded-lg focus:outline-none focus:border-accent"
                placeholder="7000000"
              />
            </label>
            <label className="block">
              <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1">
                {lang === "fr" ? "Stock" : "Stock"}
              </span>
              <input
                type="number"
                value={String(newVariant.stock)}
                onChange={(e) => setNewVariant((v) => ({ ...v, stock: Number(e.target.value) }))}
                className="w-full h-10 bg-background border border-border px-3 text-sm rounded-lg focus:outline-none focus:border-accent"
                placeholder="5"
              />
            </label>
          </div>

          {/* Couleur + Image */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1">
                {lang === "fr" ? "Couleur (hex)" : "Color (hex)"}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newVariant.color || "#000000"}
                  onChange={(e) => setNewVariant((v) => ({ ...v, color: e.target.value }))}
                  className="h-10 w-12 rounded-lg border border-border cursor-pointer"
                />
                <input
                  value={newVariant.color}
                  onChange={(e) => setNewVariant((v) => ({ ...v, color: e.target.value }))}
                  className="flex-1 h-10 bg-background border border-border px-3 text-sm rounded-lg focus:outline-none focus:border-accent"
                  placeholder="#FF0000 (vide = pas une couleur)"
                />
              </div>
            </label>
            <label className="block">
              <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1">
                {lang === "fr" ? "Image variante" : "Variant image"}
              </span>
              <div className="flex items-center gap-2">
                {newVariant.image && (
                  <img src={newVariant.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                )}
                <label className="inline-flex items-center gap-1.5 px-3 py-2 text-[10px] tracking-luxe-sm uppercase font-sans border border-border rounded-lg cursor-pointer hover:bg-secondary">
                  <Upload className="h-3 w-3" />
                  {lang === "fr" ? "Téléverser" : "Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const fd = new FormData();
                      fd.append("file", f);
                      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                      const data = await res.json();
                      if (res.ok) setNewVariant((v) => ({ ...v, image: data.url }));
                    }}
                  />
                </label>
              </div>
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-[11px] tracking-luxe-sm uppercase font-sans border border-border rounded-full hover:bg-secondary"
            >
              {t.admin.cancel}
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] tracking-luxe-sm uppercase font-sans bg-foreground text-background rounded-full hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
            >
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}
              {t.admin.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
