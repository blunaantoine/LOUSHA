"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { toast } from "sonner";
import { Trash2, Users } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  active: boolean;
  createdAt: string;
}

export function NewsletterManager() {
  const { lang } = useStore();
  const t = useDict(lang);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loadingKey, setLoadingKey] = useState<number | null>(0);

  const load = useCallback(() => {
    fetch("/api/admin/newsletter", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { subscribers: [] }))
      .then((d) => {
        setSubscribers(d.subscribers || []);
        setLoadingKey((k) => (k ?? 0) + 1);
      })
      .catch(() => setLoadingKey((k) => (k ?? 0) + 1));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loading = loadingKey === 0;

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/newsletter/${id}`, { method: "DELETE" });
    toast.success(lang === "fr" ? "Abonné supprimé" : "Subscriber deleted");
    load();
  };

  if (loading) {
    return <div className="h-32 bg-secondary animate-pulse rounded-2xl" />;
  }

  if (subscribers.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-border rounded-2xl">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" strokeWidth={1.5} />
        <p className="font-serif text-xl text-muted-foreground">
          {lang === "fr" ? "Aucun abonné" : "No subscribers"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        {subscribers.length} {lang === "fr" ? "abonné(s)" : "subscriber(s)"}
      </p>
      <div className="space-y-2">
        {subscribers.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center gap-4 p-4 border border-border rounded-2xl"
          >
            <span className="h-10 w-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <Users className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-sans font-medium text-sm truncate">{sub.email}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(sub.createdAt).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
            <button
              onClick={() => handleDelete(sub.id)}
              className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
