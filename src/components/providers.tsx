"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Provider de session NextAuth (côté client).
 * Wrappé autour de l'app dans le layout root.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
