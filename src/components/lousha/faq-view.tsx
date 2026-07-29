"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { ChevronDown, HelpCircle, MessageCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const WHATSAPP_NUMBER = "22896692972";

export function FAQView() {
  const { lang } = useStore();
  const t = useDict(lang);
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(0);

  const faqs = lang === "fr" ? [
    { q: "Quels sont vos prix ?", a: "Nos prix varient de 25 000 à 70 000 XOF selon les produits. Chaque pièce est unique et faite main, ce qui justifie son prix." },
    { q: "Comment passer une commande ?", a: "Vous pouvez commander de deux façons :\n1. Sur le site : ajoutez les produits au panier, puis cliquez sur « Commander ».\n2. Via WhatsApp : cliquez sur « Commander sur WhatsApp » sur n'importe quel produit." },
    { q: "Faites-vous des commandes sur-mesure ?", a: "Oui ! Nous acceptons les commandes personnalisées. Contactez-nous via WhatsApp avec vos exigences (couleur, taille, modèle) et nos artisans créeront une pièce unique pour vous." },
    { q: "Quels sont les modes de paiement ?", a: "Le paiement se fait via WhatsApp pour convenir avec l'équipe. Les boutons de paiement en ligne peuvent être temporairement désactivés." },
    { q: "D'où viennent vos produits ?", a: "Tous nos produits sont faits main au Togo par nos artisans, sans intermédiaire. Le raphia est récolté et tressé localement." },
    { q: "Qu'est-ce que le raphia ?", a: "Le raphia est une fibre végétale 100% naturelle récoltée sur le palmier raphia. Souple, résistante et lumineuse, elle se prête à un tressage d'une finesse remarquable." },
    { q: "Comment sont gérées les livraisons ?", a: "La livraison est gérée hors site. Contactez-nous via WhatsApp (+228 96 69 29 72) pour connaître les modalités et délais." },
    { q: "Puis-je retourner un produit ?", a: "Chaque pièce étant unique et faite main, les retours sont évalués au cas par cas. Contactez-nous via WhatsApp pour toute question." },
    { q: "Comment vous contacter ?", a: "📧 bonjour@lousha-accessories.com\n📱 WhatsApp : +228 96 69 29 72\n🕐 Lun-Sam : 9h-19h (GMT)" },
  ] : [
    { q: "What are your prices?", a: "Our prices range from 25,000 to 70,000 XOF depending on the product. Each piece is unique and handmade, which justifies its price." },
    { q: "How to place an order?", a: "You can order in two ways:\n1. On the site: add products to cart, then click 'Checkout'.\n2. Via WhatsApp: click 'Order on WhatsApp' on any product." },
    { q: "Do you make custom orders?", a: "Yes! We accept custom orders. Contact us via WhatsApp with your requirements (color, size, model) and our artisans will create a unique piece for you." },
    { q: "What are the payment methods?", a: "Payment is handled via WhatsApp to arrange with the team. Online payment buttons may be temporarily disabled." },
    { q: "Where do your products come from?", a: "All our products are handmade in Togo by our artisans, with no middlemen. Raffia is harvested and woven locally." },
    { q: "What is raffia?", a: "Raffia is a 100% natural plant fiber harvested from the raffia palm. Supple, resistant and luminous, it lends itself to remarkably fine weaving." },
    { q: "How are deliveries handled?", a: "Delivery is managed offline. Contact us via WhatsApp (+228 96 69 29 72) for details and timelines." },
    { q: "Can I return a product?", a: "Since each piece is unique and handmade, returns are evaluated case by case. Contact us via WhatsApp for any question." },
    { q: "How to contact you?", a: "📧 bonjour@lousha-accessories.com\n📱 WhatsApp: +228 96 69 29 72\n🕐 Mon-Sat: 9am-7pm (GMT)" },
  ];

  return (
    <section className="py-16 sm:py-24 bg-background min-h-[60vh]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
            {lang === "fr" ? "Questions fréquentes" : "Frequently asked questions"}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground">FAQ</h1>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-secondary/30 transition-colors"
              >
                <span className="font-sans font-medium text-sm sm:text-base">{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300",
                    open === i && "rotate-180"
                  )}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground font-light leading-relaxed whitespace-pre-line">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {lang === "fr" ? "Vous n'avez pas trouvé votre réponse ?" : "Didn't find your answer?"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => router.push("/contact")}
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[12px] tracking-luxe-sm uppercase font-sans rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {lang === "fr" ? "Nous contacter" : "Contact us"}
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-3 text-[12px] tracking-luxe-sm uppercase font-sans rounded-full hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
