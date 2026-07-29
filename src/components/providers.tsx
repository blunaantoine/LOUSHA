"use client";

import { SessionProvider } from "next-auth/react";

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
      {children}
    </SessionProvider>
  );
}
