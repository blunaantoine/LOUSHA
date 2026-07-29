"use client";

import { AppShell } from "@/components/lousha/app-shell";
import { MaterialSection } from "@/components/lousha/material-section";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";

export function MaterialPageClient() {
  const { lang, setView } = useStore();
  const t = useDict(lang);

  return (
    <AppShell>
      <div className="pt-8">
        <MaterialSection />
        <MaterialPromise />
      </div>
    </AppShell>
  );

  function MaterialPromise() {
    return (
      <section className="py-20 sm:py-28 bg-secondary/30">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
            {lang === "fr" ? "Notre promesse" : "Our promise"}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-foreground text-balance">
            {lang === "fr"
              ? "Chaque pièce Lousha est unique, comme vous."
              : "Every Lousha piece is unique, like you."}
          </h2>
          <p className="mt-5 text-muted-foreground font-light">
            {lang === "fr"
              ? "En choisissant Lousha, vous soutenez un artisanat éthique et durable, et vous offrez à votre quotidien une pièce qui a une histoire."
              : "By choosing Lousha, you support an ethical and sustainable craft, and you bring into your daily life a piece that has a story."}
          </p>
          <button
            onClick={() => setView("shop")}
            className="group mt-9 inline-flex items-center gap-2 bg-foreground text-background px-7 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors rounded-full"
          >
            {t.story.cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>
    );
  }
}
