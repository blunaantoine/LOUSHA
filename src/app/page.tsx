"use client";

import { useStore } from "@/lib/store";
import { Header } from "@/components/lousha/header";
import { HeroSlideshow } from "@/components/lousha/hero";
import { CategoryGrid } from "@/components/lousha/category-grid";
import { PromoBanner } from "@/components/lousha/promo-banner";
import { FeaturedProducts } from "@/components/lousha/featured-products";
import { StorySection } from "@/components/lousha/story-section";
import { MaterialSection } from "@/components/lousha/material-section";
import { ShopView } from "@/components/lousha/shop-view";
import { ContactSection } from "@/components/lousha/contact-section";
import { Footer } from "@/components/lousha/footer";
import { WhatsAppWidget } from "@/components/lousha/whatsapp-widget";
import { CartDrawer } from "@/components/lousha/cart-drawer";
import { CheckoutDrawer } from "@/components/lousha/checkout-drawer";
import { ProductQuickView } from "@/components/lousha/product-quick-view";
import { useDict } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const { view, setView, lang } = useStore();
  const t = useDict(lang);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {view === "home" && (
          <>
            <HeroSlideshow />
            <CategoryGrid />
            <PromoBanner />
            <FeaturedProducts />
            <StorySection />
            <MaterialSection />
            <ContactCTA />
          </>
        )}

        {view === "shop" && <ShopView />}

        {view === "story" && (
          <div className="pt-8">
            <StorySection />
            <AtelierGallery />
          </div>
        )}

        {view === "material" && (
          <div className="pt-8">
            <MaterialSection />
            <MaterialPromise />
          </div>
        )}

        {view === "contact" && (
          <div className="pt-8">
            <ContactSection />
          </div>
        )}
      </main>

      <Footer />

      {/* Overlays */}
      <CartDrawer />
      <CheckoutDrawer />
      <ProductQuickView />
      <WhatsAppWidget />
    </div>
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
              className="group inline-flex items-center gap-2 bg-background text-foreground px-7 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors"
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
                alt=""
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            <div className="aspect-square overflow-hidden bg-secondary">
              <img
                src="/images/story/atelier-2.png"
                alt=""
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
            <div className="aspect-square overflow-hidden bg-secondary col-span-2 lg:col-span-1">
              <img
                src="/images/story/portrait-artisan.png"
                alt=""
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

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
            className="group mt-9 inline-flex items-center gap-2 bg-foreground text-background px-7 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {t.story.cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>
    );
  }
}
