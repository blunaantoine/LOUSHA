"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "bot" | "user";
  text: string;
  link?: { label: string; action: () => void };
}

const WHATSAPP_NUMBER = "22896692972";

export function ChatBot() {
  const { lang, setView, openProduct } = useStore();
  const t = useDict(lang);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Init message only on first mount
    if (messages.length === 0) {
      setMessages([
        {
          role: "bot",
          text:
            lang === "fr"
              ? "Bonjour 👋 Je suis Lousha Bot. Comment puis-je vous aider ?"
              : "Hello 👋 I'm Lousha Bot. How can I help you?",
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fr = lang === "fr";

  const getBotResponse = (userText: string): Message => {
    const text = userText.toLowerCase();

    // Prix
    if (text.includes("prix") || text.includes("price") || text.includes("coût") || text.includes("combien") || text.includes("cher")) {
      return {
        role: "bot",
        text: fr
          ? "Nos prix varient de 25 000 à 70 000 XOF selon les produits. Vous pouvez voir tous les prix dans notre boutique !"
          : "Our prices range from 25,000 to 70,000 XOF. Check our shop for details!",
        link: { label: fr ? "🛍️ Voir la boutique" : "🛍️ View shop", action: () => setView("shop") },
      };
    }

    // Produits / catalogue
    if (text.includes("produit") || text.includes("article") || text.includes("catalogue") || text.includes("product") || text.includes("que vend") || text.includes("quels")) {
      return {
        role: "bot",
        text: fr
          ? "Nous proposons :\n• Paniers de décoration (Jardin, Abeille, Étagère, à Couvercle)\n• Sets de table (Soleil, Océan, Brume, Trio)\n\nTous faits main en raphia naturel au Togo !"
          : "We offer:\n• Decorative baskets (Garden, Bee, Shelf, Lidded)\n• Placemats (Sun, Ocean, Mist, Trio)\n\nAll handmade with natural raffia in Togo!",
        link: { label: fr ? "🛍️ Voir tous les produits" : "🛍️ View all products", action: () => setView("shop") },
      };
    }

    // Chapeau / sac (produits spécifiques)
    if (text.includes("chapeau") || text.includes("hat") || text.includes("sac") || text.includes("bag") || text.includes("panier") || text.includes("basket") || text.includes("set de table") || text.includes("placemat")) {
      return {
        role: "bot",
        text: fr
          ? "Vous cherchez ce type de produit ? Découvrez notre collection complète dans la boutique !"
          : "Looking for this type of product? Discover our full collection in the shop!",
        link: { label: fr ? "🛍️ Parcourir la boutique" : "🛍️ Browse shop", action: () => setView("shop") },
      };
    }

    // Commande spéciale / sur-mesure
    if (text.includes("sur-mesure") || text.includes("special") || text.includes("custom") || text.includes("personnalis") || text.includes("commande special")) {
      return {
        role: "bot",
        text: fr
          ? "Oui ! Nous acceptons les commandes sur-mesure 🎨\n\nContactez-nous via WhatsApp avec vos exigences (couleur, taille, modèle) et nos artisans créeront une pièce unique pour vous !"
          : "Yes! We accept custom orders 🎨\n\nContact us via WhatsApp with your requirements (color, size, model) and our artisans will create a unique piece for you!",
        link: { label: "💬 WhatsApp", action: () => window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(fr ? "Bonjour, je souhaite une commande sur-mesure" : "Hello, I'd like a custom order")}`, "_blank") },
      };
    }

    // Livraison
    if (text.includes("livraison") || text.includes("delivery") || text.includes("shipping") || text.includes("expédition")) {
      return {
        role: "bot",
        text: fr
          ? "La livraison est gérée hors site. Contactez-nous via WhatsApp (+228 96 69 29 72) pour les détails."
          : "Delivery is managed offline. Contact us via WhatsApp (+228 96 69 29 72) for details.",
        link: { label: "💬 WhatsApp", action: () => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank") },
      };
    }

    // Raphia / matière
    if (text.includes("raphia") || text.includes("matière") || text.includes("material") || text.includes("fibre")) {
      return {
        role: "bot",
        text: fr
          ? "Le raphia est une fibre végétale 100% naturelle récoltée au Togo. Souple, résistante et lumineuse — parfaite pour la décoration !"
          : "Raffia is a 100% natural plant fiber harvested in Togo. Supple, resistant and luminous — perfect for decoration!",
        link: { label: fr ? "📖 En savoir plus" : "📖 Learn more", action: () => setView("material") },
      };
    }

    // Togo / origine
    if (text.includes("togo") || text.includes("origine") || text.includes("origin") || text.includes("fait main") || text.includes("handmade") || text.includes("artisan")) {
      return {
        role: "bot",
        text: fr
          ? "Tous nos produits sont faits main au Togo par nos artisans, sans intermédiaire. Découvrez notre histoire !"
          : "All our products are handmade in Togo by our artisans, with no middlemen. Discover our story!",
        link: { label: fr ? "📖 Notre histoire" : "📖 Our story", action: () => setView("story") },
      };
    }

    // Commander / acheter
    if (text.includes("commander") || text.includes("order") || text.includes("acheter") || text.includes("buy") || text.includes("achat")) {
      return {
        role: "bot",
        text: fr
          ? "Vous pouvez commander :\n1️⃣ Sur le site (Ajouter au panier → Commander)\n2️⃣ Via WhatsApp directement\n\nLes deux options sont disponibles sur chaque produit !"
          : "You can order:\n1️⃣ On the site (Add to cart → Checkout)\n2️⃣ Via WhatsApp directly\n\nBoth options are available on each product!",
        link: { label: fr ? "🛍️ Voir la boutique" : "🛍️ View shop", action: () => setView("shop") },
      };
    }

    // Engagements
    if (text.includes("engagement") || text.includes("garantie") || text.includes("qualité") || text.includes("quality") || text.includes("engagement")) {
      return {
        role: "bot",
        text: fr
          ? "Nos engagements :\n✅ Qualité garantie — chaque pièce vérifiée à la main\n✅ Support 24/7\n✅ Paiement sécurisé\n✅ Fait main au Togo — Raphia 100% naturel"
          : "Our commitments:\n✅ Quality guaranteed — each piece hand-checked\n✅ 24/7 support\n✅ Secure payment\n✅ Handmade in Togo — 100% natural raffia",
      };
    }

    // FAQ / aide
    if (text.includes("faq") || text.includes("aide") || text.includes("help") || text.includes("question")) {
      return {
        role: "bot",
        text: fr
          ? "Questions fréquentes :\n❓ Quels sont vos prix ? (25 000 - 70 000 XOF)\n❓ Comment commander ? (Site ou WhatsApp)\n❓ Faites-vous du sur-mesure ? (Oui !)\n❓ D'où viennent vos produits ? (Togo, fait main)\n\nPosez-moi votre question !"
          : "Frequently asked questions:\n❓ What are your prices? (25,000 - 70,000 XOF)\n❓ How to order? (Site or WhatsApp)\n❓ Do you make custom orders? (Yes!)\n❓ Where are your products from? (Togo, handmade)\n\nAsk me your question!",
      };
    }

    // Contact
    if (text.includes("contact") || text.includes("whatsapp") || text.includes("email") || text.includes("tel") || text.includes("téléphone") || text.includes("joindre")) {
      return {
        role: "bot",
        text: fr
          ? "📧 bonjour@lousha-accessories.com\n📱 WhatsApp : +228 96 69 29 72\n🕐 Lun-Sam : 9h-19h"
          : "📧 bonjour@lousha-accessories.com\n📱 WhatsApp: +228 96 69 29 72\n🕐 Mon-Sat: 9am-7pm",
        link: { label: fr ? "📞 Page contact" : "📞 Contact page", action: () => setView("contact") },
      };
    }

    // Remerciement
    if (text.includes("merci") || text.includes("thank") || text.includes("d'accord") || text.includes("ok") || text.includes("super") || text.includes("génial")) {
      return {
        role: "bot",
        text: fr ? "Avec plaisir ! 🌿 N'hésitez pas si vous avez d'autres questions." : "You're welcome! 🌿 Feel free to ask more.",
      };
    }

    // Bonjour
    if (text.includes("bonjour") || text.includes("salut") || text.includes("hello") || text.includes("hi") || text.includes("hey") || text.includes("bonsoir")) {
      return {
        role: "bot",
        text: fr ? "Bonjour ! 👋 Comment puis-je vous aider ?" : "Hello! 👋 How can I help you?",
      };
    }

    // Fallback
    return {
      role: "bot",
      text: fr
        ? "Je peux vous aider sur :\n• Les prix et produits\n• La commande (site ou WhatsApp)\n• Le sur-mesure\n• Le raphia et nos artisans\n• La livraison\n• Nos engagements\n\nQue souhaitez-vous savoir ?"
        : "I can help you with:\n• Prices and products\n• Ordering (site or WhatsApp)\n• Custom orders\n• Raffia and our artisans\n• Delivery\n• Our commitments\n\nWhat would you like to know?",
    };
  };

  const handleSend = (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const response = getBotResponse(msg);
      setMessages((m) => [...m, response]);
      setLoading(false);
    }, 600);
  };

  const suggestions = fr
    ? ["Quels sont vos produits ?", "Quels sont vos prix ?", "Commande sur-mesure ?", "Comment commander ?", "Vos contacts"]
    : ["What are your products?", "What are your prices?", "Custom orders?", "How to order?", "Your contacts"];

  return (
    <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-accent text-accent-foreground px-5 py-4 flex items-center gap-3">
        <span className="h-10 w-10 rounded-full bg-accent-foreground/15 flex items-center justify-center">
          <Bot className="h-5 w-5" />
        </span>
        <div>
          <p className="font-serif text-lg leading-tight">Lousha Bot</p>
          <p className="text-xs text-accent-foreground/70 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            {fr ? "En ligne" : "Online"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="h-72 overflow-y-auto scroll-elegant p-4 space-y-3 bg-secondary/20">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-2.5 max-w-[90%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
            <span className={cn("h-7 w-7 rounded-full flex items-center justify-center shrink-0", msg.role === "bot" ? "bg-accent/10 text-accent" : "bg-foreground text-background")}>
              {msg.role === "bot" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            </span>
            <div>
              <div className={cn("px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line", msg.role === "bot" ? "bg-background border border-border rounded-tl-none" : "bg-foreground text-background rounded-tr-none")}>
                {msg.text}
              </div>
              {msg.link && (
                <button onClick={msg.link.action} className="mt-1.5 text-xs text-accent hover:underline font-medium">
                  {msg.link.label}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5">
            <span className="h-7 w-7 rounded-full bg-accent/10 text-accent flex items-center justify-center">
              <Bot className="h-3.5 w-3.5" />
            </span>
            <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-background border border-border">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-border">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => handleSend(s)} className="px-3 py-1.5 text-[11px] tracking-luxe-sm uppercase font-sans border border-border rounded-full hover:bg-secondary transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder={fr ? "Écrivez votre message..." : "Type your message..."} className="flex-1 h-10 bg-secondary/50 border border-border px-3 text-sm rounded-full focus:outline-none focus:border-accent transition-colors" />
        <button onClick={() => handleSend()} disabled={!input.trim() || loading} className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-50 shrink-0">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
