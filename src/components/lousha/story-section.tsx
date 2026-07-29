"use client";

import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { useSiteContent, getContent, getImage } from "@/hooks/use-site-content";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function StorySection() {
  const { lang } = useStore();
  const t = useDict(lang);
  const router = useRouter();
  const { data } = useSiteContent();

  const imgStory = getImage(data, "story-1", "/images/story/portrait-artisan.png");

  return (
    <section className="py-20 sm:py-28 bg-secondary/30 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Image unique */}
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden bg-secondary rounded-2xl shadow-lg">
              <img
                src={imgStory}
                alt={lang === "fr" ? "Artisan Lousha" : "Lousha artisan"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Text */}
          <div className="lg:pl-6">
            <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
              {t.story.eyebrow}
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl text-foreground text-balance leading-tight">
              {getContent(data, "story.title", t.story.title, lang)}
            </h2>
            <p className="mt-6 text-base text-muted-foreground font-light leading-relaxed">
              {getContent(data, "story.text1", t.story.text1, lang)}
            </p>
            <p className="mt-4 text-base text-muted-foreground font-light leading-relaxed">
              {getContent(data, "story.text2", t.story.text2, lang)}
            </p>

            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
              {t.story.stats.map((s, i) => (
                <div key={i}>
                  <p className="font-serif text-3xl text-accent">{s.value}</p>
                  <p className="text-[11px] tracking-luxe-sm uppercase text-muted-foreground mt-1">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push("/shop")}
              className="group mt-9 inline-flex items-center gap-2 bg-foreground text-background px-7 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors rounded-full"
            >
              {t.story.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
