"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { SessionProvider, useSession } from "next-auth/react";
import { Wrench } from "lucide-react";
import { useStore } from "@/lib/store";
import { SETTINGS_CHANGED_EVENT } from "@/components/lousha/maintenance-toggle";

/**
 * Charge les réglages globaux du site (ex. paiement en ligne activé ou non)
 * depuis le serveur, pour que tous les visiteurs voient la même chose.
 */
function SiteSettingsLoader() {
  const setPaymentEnabled = useStore((s) => s.setPaymentEnabled);
  const lang = useStore((s) => s.lang);
  const { data: session } = useSession();
  const [maintenance, setMaintenance] = useState(false);

  const load = useCallback(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setPaymentEnabled(d.paymentEnabled === true);
        setMaintenance(d.maintenance === true);
      })
      .catch(() => {});
  }, [setPaymentEnabled]);

  useEffect(() => {
    load();
    window.addEventListener(SETTINGS_CHANGED_EVENT, load);
    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, load);
  }, [load]);

  // Rappel visible pour l'équipe tant que le site est fermé aux visiteurs.
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!maintenance || (role !== "ADMIN" && role !== "MANAGER")) return null;
  return (
    <Link
      href="/admin"
      className="fixed bottom-4 left-4 z-[70] inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-sans font-medium text-white shadow-lg hover:bg-amber-600 max-w-[calc(100vw-2rem)]"
    >
      <Wrench className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">
        {lang === "fr"
          ? "Maintenance active — site fermé aux visiteurs"
          : "Maintenance on — site closed to visitors"}
      </span>
    </Link>
  );
}

/**
 * Provider de session NextAuth (côté client).
 * Wrappé autour de l'app dans le layout root.
 *
 * refetchOnWindowFocus=true : rafraîchit la session quand l'utilisateur
 * revient sur l'onglet (utile si la session a expiré ou été modifiée).
 * refetchInterval=60 : polling toutes les 60s pour garder la session à jour.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchOnWindowFocus={true}
      refetchInterval={60}
    >
      <SiteSettingsLoader />
      {children}
    </SessionProvider>
  );
}
