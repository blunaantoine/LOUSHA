"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Notif {
  id: string;
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
  type: string;
}

export function NotificationBell() {
  const { lang } = useStore();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { notifications: [] }))
      .then((d) => setNotifs(d.notifications || []))
      .catch(() => {});
  }, []);

  const requestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      new Notification("Lousha Accessories", {
        body: lang === "fr" ? "Notifications activées ✓" : "Notifications enabled ✓",
        icon: "/images/lousha-logo.png",
      });
    }
  };

  // Envoie une notification native si permission accordée et nouvelles notifs
  useEffect(() => {
    if (permission === "granted" && notifs.length > 0) {
      const lastSeen = sessionStorage.getItem("lastNotifSeen") || "";
      const latest = notifs[0];
      if (latest.id !== lastSeen) {
        new Notification(latest.title, {
          body: latest.message,
          icon: "/images/lousha-logo.png",
        });
        sessionStorage.setItem("lastNotifSeen", latest.id);
      }
    }
  }, [notifs, permission, lang]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-1.5 text-foreground hover:opacity-60 transition relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {notifs.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[9px] font-sans font-medium h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
            {notifs.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-background border border-border rounded-2xl shadow-xl z-40 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="font-serif text-sm">
                {lang === "fr" ? "Notifications" : "Notifications"}
              </h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Demande de permission */}
            {permission === "default" && (
              <div className="p-4 bg-accent/5 border-b border-border">
                <p className="text-xs text-muted-foreground mb-2">
                  {lang === "fr"
                    ? "Activez les notifications pour ne rien manquer."
                    : "Enable notifications to stay updated."}
                </p>
                <button
                  onClick={requestPermission}
                  className="w-full bg-foreground text-background py-2 text-[11px] tracking-luxe-sm uppercase font-sans rounded-full hover:bg-accent hover:text-accent-foreground"
                >
                  {lang === "fr" ? "Autoriser" : "Allow"}
                </button>
              </div>
            )}

            {permission === "denied" && (
              <div className="p-3 text-xs text-muted-foreground text-center border-b border-border">
                {lang === "fr"
                  ? "Notifications bloquées. Modifiez les paramètres du navigateur."
                  : "Notifications blocked. Change browser settings."}
              </div>
            )}

            {/* Liste des notifications */}
            <div className="max-h-80 overflow-y-auto scroll-elegant">
              {notifs.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  {lang === "fr" ? "Aucune notification" : "No notifications"}
                </p>
              ) : (
                notifs.map((n) => (
                  <div key={n.id} className="p-4 border-b border-border/60 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-start gap-2">
                      {n.type === "promo" && <span className="mt-1 h-2 w-2 rounded-full bg-accent shrink-0" />}
                      <div className="min-w-0">
                        <p className="font-sans font-medium text-sm">{lang === "fr" ? n.title : n.titleEn || n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{lang === "fr" ? n.message : n.messageEn || n.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
