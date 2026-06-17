"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns false during SSR and the initial hydration render, then true on
 * the client. Used to gate rendering of state that is persisted in
 * localStorage (Zustand persist) so the server HTML and the initial client
 * render match — preventing React hydration mismatches.
 *
 * Implemented with useSyncExternalStore (the React-recommended, lint-clean
 * way to detect client-only hydration).
 */
export function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true, // client snapshot
    () => false // server snapshot
  );
}
