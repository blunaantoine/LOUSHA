"use client";

import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { useStore } from "@/lib/store";

/**
 * Charge les réglages globaux du site (ex. paiement en ligne activé ou non)
 * depuis le serveur, pour que tous les visiteurs voient la même chose.
 */
function SiteSettingsLoader() {
  const setPaymentEnabled = useStore((s) => s.setPaymentEnabled);
  useEffect(() => {
    let active = true;
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d) setPaymentEnabled(d.paymentEnabled === true);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [setPaymentEnabled]);
  return null;
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
