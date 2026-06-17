"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { toast } from "sonner";
import { ArrowRight, Instagram, Facebook } from "lucide-react";

export function Footer() {
  const { lang, setView } = useStore();
  const t = useDict(lang);
  const [email, setEmail] = useState("");

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success(
      lang === "fr" ? "Merci ! Inscription confirmée." : "Thank you! Subscribed."
    );
    setEmail("");
  };

  return (
    <footer className="mt-auto bg-foreground text-background">
      {/* Newsletter */}
      <div className="border-b border-background/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-serif text-3xl sm:text-4xl">
                {t.footer.newsletter}
              </h3>
              <p className="mt-3 text-background/70 font-light max-w-md">
                {t.footer.newsletterText}
              </p>
            </div>
            <form onSubmit={subscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.footer.emailPlaceholder}
                className="flex-1 h-12 bg-transparent border border-background/30 px-4 text-sm font-sans text-background placeholder:text-background/40 focus:outline-none focus:border-background transition-colors"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-background text-foreground px-6 h-12 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {t.footer.subscribe}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex flex-col">
              <span className="font-serif text-2xl tracking-[0.18em]">
                LOUSHA
              </span>
              <span className="text-[10px] tracking-luxe uppercase text-background/60 mt-1">
                Accessories
              </span>
            </div>
            <p className="mt-5 text-sm text-background/70 font-light max-w-xs">
              {t.footer.tagline}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="h-9 w-9 rounded-full border border-background/30 flex items-center justify-center hover:bg-background hover:text-foreground transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="h-9 w-9 rounded-full border border-background/30 flex items-center justify-center hover:bg-background hover:text-foreground transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-[11px] tracking-luxe-sm uppercase text-background/50 mb-4">
              {t.footer.explore}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => setView("home")}
                  className="text-sm text-background/80 hover:text-background transition-colors"
                >
                  {t.nav.home}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView("shop")}
                  className="text-sm text-background/80 hover:text-background transition-colors"
                >
                  {t.nav.shop}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView("contact")}
                  className="text-sm text-background/80 hover:text-background transition-colors"
                >
                  {t.nav.contact}
                </button>
              </li>
            </ul>
          </div>

          {/* Maison */}
          <div>
            <h4 className="text-[11px] tracking-luxe-sm uppercase text-background/50 mb-4">
              {t.footer.maison}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => setView("story")}
                  className="text-sm text-background/80 hover:text-background transition-colors"
                >
                  {t.footer.links.story}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setView("material")}
                  className="text-sm text-background/80 hover:text-background transition-colors"
                >
                  {t.footer.links.material}
                </button>
              </li>
              <li>
                <span className="text-sm text-background/50 cursor-default">
                  {t.footer.links.engagements}
                </span>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-[11px] tracking-luxe-sm uppercase text-background/50 mb-4">
              {t.footer.help}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <span className="text-sm text-background/50 cursor-default">
                  {t.footer.links.shipping}
                </span>
              </li>
              <li>
                <span className="text-sm text-background/50 cursor-default">
                  {t.footer.links.faq}
                </span>
              </li>
              <li>
                <button
                  onClick={() => setView("contact")}
                  className="text-sm text-background/80 hover:text-background transition-colors"
                >
                  {t.footer.links.contact}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-background/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-background/50">
            © {new Date().getFullYear()} Lousha Accessories. {t.footer.rights}
          </p>
          <p className="text-xs text-background/50 tracking-luxe-sm uppercase">
            Made in Togo · Raphia fait main
          </p>
        </div>
      </div>
    </footer>
  );
}
