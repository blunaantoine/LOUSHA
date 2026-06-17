"use client";

import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { Truck, BadgeCheck, Headphones, ShieldCheck } from "lucide-react";

const ICONS = [Truck, BadgeCheck, Headphones, ShieldCheck];

export function EngagementsBanner() {
  const { lang } = useStore();
  const t = useDict(lang);

  return (
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {t.engagements.items.map((item, i) => {
            const Icon = ICONS[i];
            return (
              <div
                key={i}
                className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left"
              >
                <span className="shrink-0 h-11 w-11 rounded-full border border-border bg-background flex items-center justify-center text-accent">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl text-foreground leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground font-light mt-1">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
