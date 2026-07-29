"use client";

import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { ShoppingBag, Truck, ShieldCheck, Headphones, MessageCircle, ArrowRight, Package, CreditCard, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

const WHATSAPP_NUMBER = "22896692972";

export function HelpView() {
  const { lang } = useStore();
  const t = useDict(lang);
  const router = useRouter();

  const topics = lang === "fr" ? [
    { icon: ShoppingBag, title: "Passer une commande", text: "Ajoutez vos produits au panier puis cliquez sur « Commander ». Vous pouvez aussi commander via WhatsApp.", action: () => router.push("/shop") },
    { icon: CreditCard, title: "Paiement", text: "Le paiement se fait via WhatsApp. Les boutons de paiement en ligne peuvent être désactivés temporairement.", action: () => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank") },
    { icon: Truck, title: "Livraison", text: "La livraison est gérée hors site. Contactez-nous pour les détails et délais.", action: () => router.push("/contact") },
    { icon: Package, title: "Suivi de commande", text: "Consultez « Mon compte » pour voir le statut de vos commandes.", action: () => router.push("/account") },
    { icon: RefreshCw, title: "Retours", text: "Chaque pièce étant unique, les retours sont évalués au cas par cas. Contactez-nous.", action: () => router.push("/contact") },
    { icon: ShieldCheck, title: "Qualité garantie", text: "Chaque pièce est vérifiée à la main. Nos produits sont en raphia 100% naturel fait main au Togo.", action: () => router.push("/material") },
  ] : [
    { icon: ShoppingBag, title: "Place an order", text: "Add products to cart then click 'Checkout'. You can also order via WhatsApp.", action: () => router.push("/shop") },
    { icon: CreditCard, title: "Payment", text: "Payment is handled via WhatsApp. Online payment buttons may be temporarily disabled.", action: () => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank") },
    { icon: Truck, title: "Delivery", text: "Delivery is managed offline. Contact us for details and timelines.", action: () => router.push("/contact") },
    { icon: Package, title: "Order tracking", text: "Check 'My account' to see your order status.", action: () => router.push("/account") },
    { icon: RefreshCw, title: "Returns", text: "Since each piece is unique, returns are evaluated case by case. Contact us.", action: () => router.push("/contact") },
    { icon: ShieldCheck, title: "Quality guaranteed", text: "Each piece is hand-checked. Our products are 100% natural raffia handmade in Togo.", action: () => router.push("/material") },
  ];

  return (
    <section className="py-16 sm:py-24 bg-background min-h-[60vh]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
            {lang === "fr" ? "Centre d'aide" : "Help center"}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground">
            {lang === "fr" ? "Aide" : "Help"}
          </h1>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {topics.map((topic, i) => {
            const Icon = topic.icon;
            return (
              <button
                key={i}
                onClick={topic.action}
                className="group flex items-start gap-4 p-5 border border-border rounded-2xl hover:border-accent/40 hover:bg-secondary/30 transition-all text-left"
              >
                <span className="h-10 w-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-serif text-lg text-foreground mb-1">{topic.title}</h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed">{topic.text}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="border-t border-border pt-8">
          <h2 className="font-serif text-2xl text-foreground mb-6 text-center">
            {lang === "fr" ? "Besoin d'aide supplémentaire ?" : "Need more help?"}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => router.push("/faq")}
              className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[12px] tracking-luxe-sm uppercase font-sans rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {lang === "fr" ? "Voir la FAQ" : "View FAQ"}
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => router.push("/contact")}
              className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-3 text-[12px] tracking-luxe-sm uppercase font-sans rounded-full hover:bg-secondary transition-colors"
            >
              <Headphones className="h-4 w-4" />
              {lang === "fr" ? "Nous contacter" : "Contact us"}
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 text-[12px] tracking-luxe-sm uppercase font-sans rounded-full hover:bg-[#1eb858] transition-colors"
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
