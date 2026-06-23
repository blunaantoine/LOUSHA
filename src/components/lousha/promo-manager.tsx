"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload, Trash2, Loader2, Plus, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface PromoSlide {
  id: string;
  image: string;
  titleFr: string;
  titleEn: string;
  textFr: string;
  textEn: string;
  linkView: string;
  linkLabelFr: string;
  linkLabelEn: string;
  bgColor: string;
  order: number;
  active: boolean;
}

const LINK_OPTIONS = [
  { value: "shop", label: "Boutique" },
  { value: "story", label: "Notre Histoire" },
  { value: "material", label: "La Matière" },
  { value: "contact", label: "Contact" },
];

export function PromoManager() {
  const { lang } = useStore();
  const t = useDict(lang);
  const [slides, setSlides] = useState<PromoSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PromoSlide | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/promo", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { slides: [] }))
      .then((d) => setSlides(d.slides || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-24 bg-secondary animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {slides.length} {slides.length > 1 ? "slides" : "slide"}
        </p>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Plus className="h-4 w-4" />
          {lang === "fr" ? "Ajouter un slide" : "Add slide"}
        </button>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground">{lang === "fr" ? "Aucun slide promo" : "No promo slides"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((s, idx) => (
            <div
              key={s.id}
              className="flex items-center gap-4 p-4 border border-border rounded-2xl hover:border-accent/40 transition-colors"
            >
              <img src={s.image} alt="" className="h-16 w-24 rounded-lg object-cover bg-secondary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-sans font-medium truncate">{lang === "fr" ? s.titleFr : s.titleEn || "(sans titre)"}</p>
                <p className="text-xs text-muted-foreground truncate">{lang === "fr" ? s.textFr : s.textEn || "—"}</p>
              </div>
              <div className="flex items-center gap-1">
                <IconBtn
                  onClick={async () => {
                    await fetch(`/api/admin/promo/${s.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ active: !s.active }),
                    });
                    load();
                  }}
                  title={s.active ? "Désactiver" : "Activer"}
                >
                  {s.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </IconBtn>
                <IconBtn
                  onClick={async () => {
                    await fetch(`/api/admin/promo/${s.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ order: s.order - 1 }),
                    });
                    const prev = slides[idx - 1];
                    if (prev) await fetch(`/api/admin/promo/${prev.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ order: prev.order + 1 }),
                    });
                    load();
                  }}
                  disabled={idx === 0}
                  title="Monter"
                >
                  <ArrowUp className="h-4 w-4" />
                </IconBtn>
                <IconBtn
                  onClick={async () => {
                    await fetch(`/api/admin/promo/${s.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ order: s.order + 1 }),
                    });
                    const next = slides[idx + 1];
                    if (next) await fetch(`/api/admin/promo/${next.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ order: next.order - 1 }),
                    });
                    load();
                  }}
                  disabled={idx === slides.length - 1}
                  title="Descendre"
                >
                  <ArrowDown className="h-4 w-4" />
                </IconBtn>
                <IconBtn onClick={() => setEditing(s)} title="Modifier">
                  <span className="text-[10px] tracking-luxe-sm uppercase">Éditer</span>
                </IconBtn>
                <IconBtn
                  onClick={async () => {
                    if (!confirm("Supprimer ce slide ?")) return;
                    await fetch(`/api/admin/promo/${s.id}`, { method: "DELETE" });
                    toast.success("Slide supprimé");
                    load();
                  }}
                  title="Supprimer"
                  danger
                >
                  <Trash2 className="h-4 w-4" />
                </IconBtn>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <SlideEditor
          slide={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); load(); }}
        />
      )}
    </div>
  );
}

function IconBtn({ children, onClick, disabled, title, danger }: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean; title: string; danger?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      className={cn("h-9 w-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-30",
        danger ? "text-destructive hover:bg-destructive/10" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
      {children}
    </button>
  );
}

function SlideEditor({ slide, onClose, onSaved }: {
  slide: PromoSlide | null; onClose: () => void; onSaved: () => void;
}) {
  const { lang } = useStore();
  const t = useDict(lang);
  const [form, setForm] = useState({
    image: slide?.image || "",
    titleFr: slide?.titleFr || "",
    titleEn: slide?.titleEn || "",
    textFr: slide?.textFr || "",
    textEn: slide?.textEn || "",
    linkView: slide?.linkView || "shop",
    linkLabelFr: slide?.linkLabelFr || "",
    linkLabelEn: slide?.linkLabelEn || "",
    bgColor: slide?.bgColor || "#8B5E3C",
    active: slide?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const update = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      update("image", data.url);
      toast.success("Image téléversée");
    } finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.image) { toast.error("Image requise"); return; }
    setSaving(true);
    try {
      const url = slide ? `/api/admin/promo/${slide.id}` : "/api/admin/promo";
      const method = slide ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { toast.error("Échec"); return; }
      toast.success(slide ? "Slide modifié" : "Slide créé");
      onSaved();
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto scroll-elegant">
        <div className="sticky top-0 flex items-center justify-between px-6 h-16 border-b border-border bg-background z-10">
          <h2 className="font-serif text-xl">{slide ? "Modifier le slide" : "Nouveau slide"}</h2>
          <button onClick={onClose} className="p-2 hover:opacity-60">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {/* Image */}
          <div>
            <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">Image</span>
            <div className="flex items-center gap-4">
              <div className="h-20 w-32 rounded-xl overflow-hidden bg-secondary shrink-0">
                {form.image && <img src={form.image} alt="" className="h-full w-full object-cover" />}
              </div>
              <label className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans rounded-full cursor-pointer hover:bg-foreground hover:text-background transition-colors">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {t.admin.uploadImage}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Titre (FR)" value={form.titleFr} onChange={(v) => update("titleFr", v)} />
            <Field label="Titre (EN)" value={form.titleEn} onChange={(v) => update("titleEn", v)} />
            <Field label="Texte (FR)" value={form.textFr} onChange={(v) => update("textFr", v)} />
            <Field label="Texte (EN)" value={form.textEn} onChange={(v) => update("textEn", v)} />
            <Field label="Label bouton (FR)" value={form.linkLabelFr} onChange={(v) => update("linkLabelFr", v)} />
            <Field label="Label bouton (EN)" value={form.linkLabelEn} onChange={(v) => update("linkLabelEn", v)} />
          </div>
          <label className="block">
            <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">Lien du bouton</span>
            <select value={form.linkView} onChange={(e) => update("linkView", e.target.value)}
              className="w-full h-11 bg-background border border-border px-3 text-sm rounded-xl focus:outline-none focus:border-accent">
              {LINK_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>

          {/* Couleur de fond */}
          <div className="flex items-center gap-3">
            <label className="block flex-1">
              <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
                Couleur de fond
              </span>
              <input
                type="text"
                value={form.bgColor}
                onChange={(e) => update("bgColor", e.target.value)}
                placeholder="#8B5E3C"
                className="w-full h-11 bg-background border border-border px-3 text-sm font-mono focus:outline-none focus:border-accent rounded-xl"
              />
            </label>
            <label className="block shrink-0 pt-5">
              <input
                type="color"
                value={form.bgColor}
                onChange={(e) => update("bgColor", e.target.value)}
                className="h-11 w-12 rounded-xl border border-border cursor-pointer"
              />
            </label>
          </div>

          {/* Présélections rapides */}
          <div className="flex flex-wrap gap-2">
            {["#8B5E3C", "#1a1a2e", "#2d5016", "#7a2048", "#1a3a4a", "#5c4033"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => update("bgColor", c)}
                className="h-8 w-8 rounded-full border-2 transition-all hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: form.bgColor === c ? "white" : "transparent",
                  boxShadow: form.bgColor === c ? "0 0 0 2px rgba(0,0,0,0.3)" : undefined,
                }}
              />
            ))}
          </div>
        </div>
        <div className="sticky bottom-0 flex justify-end gap-3 px-6 py-4 border-t border-border bg-background">
          <button onClick={onClose} className="px-5 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans border border-border rounded-full hover:bg-secondary">{t.admin.cancel}</button>
          <button onClick={handleSave} disabled={saving || uploading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans bg-foreground text-background rounded-full hover:bg-accent hover:text-accent-foreground disabled:opacity-60">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{t.admin.save}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 bg-background border border-border px-3 text-sm font-sans focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent rounded-xl" />
    </label>
  );
}
