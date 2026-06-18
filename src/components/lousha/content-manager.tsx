"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { toast } from "sonner";
import { Upload, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface SiteContentEntry {
  key: string;
  valueFr: string;
  valueEn: string;
}

interface ContentField {
  key: string;
  label: string;
  type: "text" | "textarea";
  placeholderFr?: string;
  placeholderEn?: string;
}

interface ImageField {
  key: string;
  label: string;
  fallback: string;
}

// Définition des champs textes éditables par section
const SECTIONS: { title: string; fields: ContentField[] }[] = [
  {
    title: "Bandeau promo",
    fields: [
      { key: "promo.eyebrow", label: "Eyebrow", type: "text" },
      { key: "promo.title", label: "Titre (ligne 1)", type: "text" },
      { key: "promo.titleAccent", label: "Titre (ligne 2, accent)", type: "text" },
      { key: "promo.text", label: "Texte", type: "textarea" },
    ],
  },
  {
    title: "Notre histoire",
    fields: [
      { key: "story.title", label: "Titre", type: "text" },
      { key: "story.text1", label: "Texte 1", type: "textarea" },
      { key: "story.text2", label: "Texte 2", type: "textarea" },
    ],
  },
  {
    title: "La matière",
    fields: [
      { key: "material.title", label: "Titre", type: "text" },
      { key: "material.text1", label: "Texte 1", type: "textarea" },
      { key: "material.text2", label: "Texte 2", type: "textarea" },
    ],
  },
  {
    title: "Contact",
    fields: [
      { key: "contact.title", label: "Titre", type: "text" },
      { key: "contact.subtitle", label: "Sous-titre", type: "textarea" },
    ],
  },
];

// Définition des images éditables
const IMAGES: ImageField[] = [
  { key: "story-1", label: "Story — Portrait artisan", fallback: "/images/story/portrait-artisan.png" },
  { key: "story-2", label: "Story — Atelier", fallback: "/images/story/atelier-1.png" },
  { key: "story-3", label: "Story — Détail", fallback: "/images/story/atelier-2.png" },
  { key: "material", label: "La matière — Image", fallback: "/images/categories/cat-artisanat.png" },
  { key: "promo", label: "Promo — Image pop-out", fallback: "/images/hero-bag-transparent.png" },
];

export function ContentManager() {
  const { lang } = useStore();
  const t = useDict(lang);
  const [content, setContent] = useState<Record<string, SiteContentEntry>>({});
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { content: {} }))
      .then((d) => setContent(d.content || {}))
      .finally(() => setLoading(false));
    fetch("/api/admin/content/images", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { images: {} }))
      .then((d) => setImages(d.images || {}));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateField = (key: string, langCode: "fr" | "en", value: string) => {
    setContent((c) => ({
      ...c,
      [key]: {
        key,
        valueFr: langCode === "fr" ? value : c[key]?.valueFr || "",
        valueEn: langCode === "en" ? value : c[key]?.valueEn || "",
      },
    }));
  };

  const handleUpload = async (key: string, file: File) => {
    setUploadingKey(key);
    try {
      // 1. Upload le fichier
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        toast.error(uploadData.error || "Upload échoué");
        return;
      }

      // 2. Sauvegarde l'URL en DB
      const saveRes = await fetch("/api/admin/content/images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: [{ key, url: uploadData.url }] }),
      });
      if (!saveRes.ok) {
        toast.error("Image uploadée mais non sauvegardée en DB");
        return;
      }

      // 3. Met à jour l'état local
      setImages((i) => ({ ...i, [key]: uploadData.url }));
      toast.success("Image mise à jour");
    } catch (e) {
      toast.error("Erreur réseau");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const entries = Object.values(content);
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      if (!res.ok) {
        toast.error("Échec");
        return;
      }
      toast.success("Contenu enregistré");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-secondary animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Textes éditables */}
      {SECTIONS.map((section) => (
        <div key={section.title} className="border border-border rounded-2xl p-5">
          <h3 className="font-serif text-xl text-foreground mb-4">{section.title}</h3>
          <div className="space-y-4">
            {section.fields.map((field) => (
              <div key={field.key} className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block">
                    <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
                      {field.label} (FR)
                    </span>
                    {field.type === "textarea" ? (
                      <textarea
                        rows={3}
                        value={content[field.key]?.valueFr || ""}
                        onChange={(e) => updateField(field.key, "fr", e.target.value)}
                        className="w-full bg-background border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-accent rounded-xl resize-none"
                      />
                    ) : (
                      <input
                        value={content[field.key]?.valueFr || ""}
                        onChange={(e) => updateField(field.key, "fr", e.target.value)}
                        className="w-full h-10 bg-background border border-border px-3 text-sm font-sans focus:outline-none focus:border-accent rounded-xl"
                      />
                    )}
                  </label>
                </div>
                <div>
                  <label className="block">
                    <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
                      {field.label} (EN)
                    </span>
                    {field.type === "textarea" ? (
                      <textarea
                        rows={3}
                        value={content[field.key]?.valueEn || ""}
                        onChange={(e) => updateField(field.key, "en", e.target.value)}
                        className="w-full bg-background border border-border px-3 py-2 text-sm font-sans focus:outline-none focus:border-accent rounded-xl resize-none"
                      />
                    ) : (
                      <input
                        value={content[field.key]?.valueEn || ""}
                        onChange={(e) => updateField(field.key, "en", e.target.value)}
                        className="w-full h-10 bg-background border border-border px-3 text-sm font-sans focus:outline-none focus:border-accent rounded-xl"
                      />
                    )}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Images éditables */}
      <div className="border border-border rounded-2xl p-5">
        <h3 className="font-serif text-xl text-foreground mb-4">Images</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {IMAGES.map((img) => (
            <div key={img.key} className="border border-border rounded-xl p-3">
              <p className="text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-2">
                {img.label}
              </p>
              <div className="aspect-video bg-secondary rounded-lg overflow-hidden mb-2">
                <img
                  src={images[img.key] || img.fallback}
                  alt={img.label}
                  className="h-full w-full object-cover"
                />
              </div>
              <label className="inline-flex items-center gap-2 w-full justify-center border border-border px-3 py-2 text-[10px] tracking-luxe-sm uppercase font-sans rounded-full cursor-pointer hover:bg-foreground hover:text-background transition-colors">
                {uploadingKey === img.key ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                {t.admin.uploadImage}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(img.key, f);
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Bouton sauvegarder (textes) */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[12px] tracking-luxe-sm uppercase font-sans rounded-full hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-60 shadow-lg"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t.admin.save}
        </button>
      </div>
    </div>
  );
}
