"use client";

import { AuthView } from "@/components/lousha/auth-view";
import { AppShell } from "@/components/lousha/app-shell";

export default function LoginPage() {
  return (
    <AppShell>
      <AuthView />
    </AppShell>
  );
}
