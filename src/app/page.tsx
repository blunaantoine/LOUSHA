"use client";

import { AppShell } from "@/components/lousha/app-shell";
import { HeroSlideshow } from "@/components/lousha/hero";
import { CategoryGrid } from "@/components/lousha/category-grid";
import { PromoBanner } from "@/components/lousha/promo-banner";
import { FeaturedProducts } from "@/components/lousha/featured-products";
import { StorySection } from "@/components/lousha/story-section";
import { MaterialSection } from "@/components/lousha/material-section";
import { ContactSection } from "@/components/lousha/contact-section";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const { setView, lang } = useStore();
  const t = useDict(lang);

  return (
    <AppShell>
      <HeroSlideshow />
      <CategoryGrid />
      <PromoBanner />
      <FeaturedProducts />
      <ContactCTA />
    </AppShell>
  );

  function ContactCTA() {
    return (
      <section className="relative py-24 sm:py-32 overflow-hidden">
        <img
          src="/images/hero/hero-3.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/55" />
        <div className="relative mx-auto max-w-3xl px-6 text-center text-background">
          <p className="text-[11px] tracking-luxe uppercase text-background/75 mb-4">
            {t.contact.eyebrow}
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-balance">
            {t.contact.title}
          </h2>
          <p className="mt-5 text-background/85 font-light max-w-xl mx-auto">
            {t.contact.subtitle}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setView("contact")}
              className="group inline-flex items-center gap-2 bg-background text-foreground px-7 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors rounded-full"
            >
              {t.nav.contact}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="https://wa.me/22896692972"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-background/50 text-background px-7 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-background/10 transition-colors"
            >
              {t.contact.whatsapp}
            </a>
          </div>
        </div>
      </section>
    );
  }
}
