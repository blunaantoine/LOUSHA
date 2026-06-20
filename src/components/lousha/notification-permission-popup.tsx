"use client";

import { useEffect, useState } from "react";
import { Bell, X, Check } from "lucide-react";

/**
 * Demande automatiquement la permission de notification
 * au premier visit du site, en popup (pas de cloche dans le header).
 * Les notifications sont gérées uniquement par l'admin (push navigateur).
 */
export function NotificationPermissionPopup() {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    // Initialisation de la permission dans le timer pour éviter setState synchrone
    const initTimer = setTimeout(() => {
      setPermission(Notification.permission);

      // Vérifie si on a déjà demandé (sessionStorage)
      const alreadyAsked = sessionStorage.getItem("notifAsked");
      if (alreadyAsked) return;

      if (Notification.permission === "default") {
        setShow(true);
        sessionStorage.setItem("notifAsked", "true");
      }
    }, 3000);

    return () => clearTimeout(initTimer);
  }, []);

  const handleAllow = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setShow(false);
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    setShow(false);

    if (result === "granted") {
      new Notification("Lousha Accessories", {
        body: "Notifications activées ✓ Merci !",
        icon: "/images/lousha-logo.png",
      });
    }
  };

  const handleDeny = () => {
    setShow(false);
  };

  if (!show || permission !== "default") return null;

  return (
    <div className="fixed bottom-5 left-5 z-[80] animate-fade-up">
      <div className="bg-background border border-border rounded-2xl shadow-2xl p-5 max-w-sm w-[calc(100vw-2.5rem)]">
        <div className="flex items-start gap-3">
          <span className="h-10 w-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
            <Bell className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-base text-foreground mb-1">
              {typeof window !== "undefined" && document.documentElement.lang === "fr"
                ? "Restez informé"
                : "Stay informed"}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {typeof window !== "undefined" && document.documentElement.lang === "fr"
                ? "Recevez nos nouveautés, promotions et annonces directement sur votre navigateur."
                : "Get our latest news, promotions and announcements directly in your browser."}
            </p>
          </div>
          <button onClick={handleDeny} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleAllow}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-foreground text-background py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
            {typeof window !== "undefined" && document.documentElement.lang === "fr"
              ? "Autoriser"
              : "Allow"}
          </button>
          <button
            onClick={handleDeny}
            className="px-4 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans border border-border rounded-full hover:bg-secondary transition-colors"
          >
            {typeof window !== "undefined" && document.documentElement.lang === "fr"
              ? "Plus tard"
              : "Later"}
          </button>
        </div>
      </div>
    </div>
  );
}
