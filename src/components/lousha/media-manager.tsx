"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload, Trash2, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";

interface ImageSlot {
  key: string;
  label: string;
  fallback: string;
}

const SLOTS: ImageSlot[] = [
  {
    key: "story-1",
    label: "Notre Histoire",
    fallback: "/images/story/portrait-artisan.png",
  },
  {
    key: "material",
    label: "La Matière",
    fallback: "/images/categories/cat-artisanat.png",
  },
];

export function MediaManager() {
  const { lang } = useStore();
  const t = useDict(lang);
  const [images, setImages] = useState<Record<string, string>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/content/images", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { images: {} }))
      .then((d) => setImages(d.images || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (key: string, file: File) => {
    setUploadingKey(key);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        toast.error(uploadData.error || "Upload échoué");
        return;
      }

      const saveRes = await fetch("/api/admin/content/images", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: [{ key, url: uploadData.url }] }),
      });
      if (!saveRes.ok) {
        toast.error("Image uploadée mais non sauvegardée");
        return;
      }

      setImages((i) => ({ ...i, [key]: uploadData.url }));
      toast.success(lang === "fr" ? "Image mise à jour" : "Image updated");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setUploadingKey(null);
    }
  };

  const handleDelete = async (key: string, label: string) => {
    if (
      !confirm(
        lang === "fr"
          ? `Supprimer l'image "${label}" ? Elle reviendra à l'image par défaut.`
          : `Delete "${label}" image? It will revert to default.`
      )
    )
      return;

    setUploadingKey(key);
    try {
      const res = await fetch(
        `/api/admin/content/images?key=${encodeURIComponent(key)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Échec");
        return;
      }
      setImages((i) => {
        const next = { ...i };
        delete next[key];
        return next;
      });
      toast.success(lang === "fr" ? "Image supprimée" : "Image deleted");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setUploadingKey(null);
    }
  };

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
      <p className="text-sm text-muted-foreground">
        {lang === "fr"
          ? "Gérez les images des sections « Notre Histoire » et « La Matière »."
          : "Manage images for the \"Our Story\" and \"Material\" sections."}
      </p>

      {SLOTS.map((slot) => {
        const currentUrl = images[slot.key] || slot.fallback;
        const isCustom = !!images[slot.key];

        return (
          <div
            key={slot.key}
            className="flex items-center gap-4 p-4 border border-border rounded-2xl hover:border-accent/40 transition-colors"
          >
            {/* Preview */}
            <div className="h-20 w-32 rounded-lg overflow-hidden bg-secondary shrink-0">
              <img
                src={currentUrl}
                alt={slot.label}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-sans font-medium">{slot.label}</p>
              <p className="text-xs text-muted-foreground truncate">
                {isCustom
                  ? lang === "fr"
                    ? "Image personnalisée"
                    : "Custom image"
                  : lang === "fr"
                    ? "Image par défaut"
                    : "Default image"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans rounded-full cursor-pointer hover:bg-foreground hover:text-background transition-colors">
                {uploadingKey === slot.key ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {lang === "fr" ? "Changer" : "Change"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(slot.key, f);
                  }}
                />
              </label>

              {isCustom && (
                <button
                  onClick={() => handleDelete(slot.key, slot.label)}
                  disabled={uploadingKey === slot.key}
                  title={
                    lang === "fr"
                      ? "Revenir à l'image par défaut"
                      : "Revert to default"
                  }
                  className="h-9 w-9 rounded-full flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
