"use client";

import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { useSiteContent, getContent, getImage } from "@/hooks/use-site-content";

export function MaterialSection() {
  const { lang } = useStore();
  const t = useDict(lang);
  const { data } = useSiteContent();

  const imgMaterial = getImage(data, "material", "/images/categories/cat-artisanat.png");

  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text first on desktop */}
          <div className="order-2 lg:order-1">
            <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
              {t.material.eyebrow}
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl text-foreground text-balance leading-tight">
              {getContent(data, "material.title", t.material.title, lang)}
            </h2>
            <p className="mt-6 text-base text-muted-foreground font-light leading-relaxed">
              {getContent(data, "material.text1", t.material.text1, lang)}
            </p>
            <p className="mt-4 text-base text-muted-foreground font-light leading-relaxed">
              {getContent(data, "material.text2", t.material.text2, lang)}
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-5">
              {t.material.points.map((p, i) => (
                <div
                  key={i}
                  className="border-l-2 border-accent/50 pl-4 py-1"
                >
                  <h3 className="font-serif text-lg text-foreground">
                    {p.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-light mt-1">
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
              <img
                src={imgMaterial}
                alt={lang === "fr" ? "Détail du raphia" : "Raffia detail"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
