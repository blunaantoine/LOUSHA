"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { toast } from "sonner";
import { ArrowRight, Instagram, Facebook } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const { lang } = useStore();
  const t = useDict(lang);
  const [email, setEmail] = useState("");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success(
          lang === "fr" ? "Merci ! Inscription confirmée." : "Thank you! Subscribed."
        );
        setEmail("");
      } else {
        toast.error(lang === "fr" ? "Échec" : "Failed");
      }
    } catch {
      toast.error(lang === "fr" ? "Erreur réseau" : "Network error");
    }
  };

  return (
    <footer className="mt-auto bg-foreground text-background">
      {/* Newsletter */}
      <div className="border-b border-background/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl sm:text-4xl">
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
                className="flex-1 h-12 bg-transparent border border-background/30 px-4 text-sm font-sans text-background placeholder:text-background/40 focus:outline-none focus:border-background transition-colors rounded-xl"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-background text-foreground px-6 h-12 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors rounded-xl"
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
              <img
                src="/images/lousha-logo.png"
                alt="Lousha Accessories"
                className="h-16 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="mt-5 text-sm text-background/70 font-light max-w-xs">
              {t.footer.tagline}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://www.instagram.com/lousha_accessoires"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="h-9 w-9 rounded-full border border-background/30 flex items-center justify-center hover:bg-background hover:text-foreground transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/loushaaccessoires"
                target="_blank"
                rel="noreferrer"
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
                <Link
                  href="/"
                  className="text-sm text-background/80 hover:text-background transition-colors"
                >
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-background/80 hover:text-background transition-colors"
                >
                  {t.nav.shop}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-background/80 hover:text-background transition-colors"
                >
                  {t.nav.contact}
                </Link>
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
                <Link
                  href="/story"
                  className="text-sm text-background/80 hover:text-background transition-colors"
                >
                  {t.footer.links.story}
                </Link>
              </li>
              <li>
                <Link
                  href="/material"
                  className="text-sm text-background/80 hover:text-background transition-colors"
                >
                  {t.footer.links.material}
                </Link>
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
                <Link
                  href="/faq"
                  className="text-sm text-background/80 hover:text-background transition-colors"
                >
                  {lang === "fr" ? "Aide" : "Help"}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-background/80 hover:text-background transition-colors"
                >
                  {t.footer.links.faq}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-background/80 hover:text-background transition-colors"
                >
                  {t.footer.links.contact}
                </Link>
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
