"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { useSiteContent, getContent } from "@/hooks/use-site-content";
import { toast } from "sonner";
import { MessageCircle, Mail, Clock, ArrowRight } from "lucide-react";

const WHATSAPP_NUMBER = "22896692972";

export function ContactSection() {
  const { lang } = useStore();
  const { data } = useSiteContent();
  const t = useDict(lang);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success(t.contact.form.success);
    setTimeout(() => setSent(false), 4000);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section className="py-20 sm:py-28 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
            {t.contact.eyebrow}
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground text-balance">
            {getContent(data, "contact.title", t.contact.title, lang)}
          </h2>
          <p className="mt-5 max-w-2xl mx-auto text-base text-muted-foreground font-light">
            {getContent(data, "contact.subtitle", t.contact.subtitle, lang)}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Contact info */}
          <div className="space-y-5">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-4 p-5 bg-background border border-border hover:border-accent transition-colors"
            >
              <span className="h-12 w-12 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0">
                <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] tracking-luxe-sm uppercase text-muted-foreground">
                  WhatsApp
                </p>
                <p className="font-serif text-lg text-foreground">
                  {t.contact.whatsappNumber}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </a>

            <div className="flex items-center gap-4 p-5 bg-background border border-border">
              <span className="h-12 w-12 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-[11px] tracking-luxe-sm uppercase text-muted-foreground">
                  {t.contact.email}
                </p>
                <p className="font-serif text-lg text-foreground">
                  {t.contact.emailValue}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 bg-background border border-border">
              <span className="h-12 w-12 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-[11px] tracking-luxe-sm uppercase text-muted-foreground">
                  {t.contact.hours}
                </p>
                <p className="font-serif text-lg text-foreground">
                  {t.contact.hoursValue}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-background border border-border p-6 sm:p-8 flex flex-col gap-4"
          >
            <label className="block">
              <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
                {t.contact.form.name}
              </span>
              <input
                required
                className="w-full h-11 bg-background border border-border px-3 text-sm font-sans focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors rounded-xl"
              />
            </label>
            <label className="block">
              <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
                {t.contact.form.email}
              </span>
              <input
                type="email"
                required
                className="w-full h-11 bg-background border border-border px-3 text-sm font-sans focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors rounded-xl"
              />
            </label>
            <label className="block flex-1">
              <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
                {t.contact.form.message}
              </span>
              <textarea
                required
                rows={5}
                className="w-full bg-background border border-border px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none rounded-xl"
              />
            </label>
            <button
              type="submit"
              disabled={sent}
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-60 rounded-full"
            >
              {sent ? "✓" : ""}
              {t.contact.form.send}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
