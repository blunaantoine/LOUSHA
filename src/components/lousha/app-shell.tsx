"use client";

import { Header } from "@/components/lousha/header";
import { Footer } from "@/components/lousha/footer";
import { CartDrawer } from "@/components/lousha/cart-drawer";
import { CheckoutDrawer } from "@/components/lousha/checkout-drawer";
import { NotificationPermissionPopup } from "@/components/lousha/notification-permission-popup";

/**
 * AppShell — layout partagé pour toutes les pages publiques.
 * Contient le Header, le Footer, et les overlays (panier, checkout, notifications).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <CheckoutDrawer />
      <NotificationPermissionPopup />
    </div>
  );
}
