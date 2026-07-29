"use client";

import { AppShell } from "@/components/lousha/app-shell";
import { StorySection } from "@/components/lousha/story-section";
import { useStore } from "@/lib/store";
import { ArrowRight } from "lucide-react";

export function StoryPageClient() {
  const { lang, setView } = useStore();

  return (
    <AppShell>
      <div className="pt-8">
        <StorySection />
        <AtelierGallery />
      </div>
    </AppShell>
  );

  function AtelierGallery() {
    return (
      <section className="py-20 sm:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
              {lang === "fr" ? "L'atelier en images" : "The atelier in images"}
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl text-foreground">
              {lang === "fr" ? "Le geste, la matière" : "The gesture, the material"}
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="aspect-square overflow-hidden bg-secondary">
              <img
                src="/images/story/atelier-1.png"
                alt="Atelier Lousha — tressage du raphia"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            <div className="aspect-square overflow-hidden bg-secondary">
              <img
                src="/images/story/atelier-2.png"
                alt="Artisan Lousha au travail"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            <div className="aspect-square overflow-hidden bg-secondary col-span-2 lg:col-span-1">
              <img
                src="/images/story/portrait-artisan.png"
                alt="Portrait d'un artisan Lousha"
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }
}
