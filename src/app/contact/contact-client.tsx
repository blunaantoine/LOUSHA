"use client";

import { AppShell } from "@/components/lousha/app-shell";
import { ContactSection } from "@/components/lousha/contact-section";

export function ContactPageClient() {
  return (
    <AppShell>
      <div className="pt-8">
        <ContactSection />
      </div>
    </AppShell>
  );
}
