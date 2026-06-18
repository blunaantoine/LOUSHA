"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Provider de session NextAuth (côté client).
 * Wrappé autour de l'app dans le layout root.
 *
 * refetchOnWindowFocus=false + refetchInterval=0 désactivent le polling
 * automatique qui peut causer des rechargements intempestifs de la page.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchOnWindowFocus={false}
      refetchInterval={0}
    >
      {children}
    </SessionProvider>
  );
}
