"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { Send, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "bot" | "user";
  text: string;
}

export function ChatBot() {
  const { lang } = useStore();
  const t = useDict(lang);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text:
        lang === "fr"
          ? "Bonjour 👋 Je suis Lousha Bot. Comment puis-je vous aider ?"
          : "Hello 👋 I'm Lousha Bot. How can I help you?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getBotResponse = (userText: string): string => {
    const text = userText.toLowerCase();
    const fr = lang === "fr";

    if (text.includes("prix") || text.includes("price") || text.includes("coût") || text.includes("combien")) {
      return fr
        ? "Nos prix varient de 25 000 à 70 000 FCFA selon les produits. Vous pouvez voir tous les prix dans notre boutique !"
        : "Our prices range from 25,000 to 70,000 FCFA depending on the product. Check our shop for details!";
    }
    if (text.includes("livraison") || text.includes("delivery") || text.includes("shipping")) {
      return fr
        ? "La livraison est gérée hors site. Contactez-nous via WhatsApp (+228 96 69 29 72) pour les détails."
        : "Delivery is managed offline. Contact us via WhatsApp (+228 96 69 29 72) for details.";
    }
    if (text.includes("raphia") || text.includes("matière") || text.includes("material")) {
      return fr
        ? "Le raphia est une fibre végétale 100% naturelle récoltée au Togo. Souple, résistante et lumineuse, parfaite pour la décoration !"
        : "Raffia is a 100% natural plant fiber harvested in Togo. Supple, resistant and luminous — perfect for decoration!";
    }
    if (text.includes("togo") || text.includes("origine") || text.includes("origin")) {
      return fr
        ? "Tous nos produits sont faits main au Togo par nos artisans, sans intermédiaire."
        : "All our products are handmade in Togo by our artisans, with no middlemen.";
    }
    if (text.includes("commander") || text.includes("order") || text.includes("acheter") || text.includes("buy")) {
      return fr
        ? "Vous pouvez commander directement sur le site (bouton 'Ajouter au panier') ou via WhatsApp (+228 96 69 29 72)."
        : "You can order directly on the site ('Add to cart' button) or via WhatsApp (+228 96 69 29 72).";
    }
    if (text.includes("contact") || text.includes("whatsapp") || text.includes("email") || text.includes("tel")) {
      return fr
        ? "📧 bonjour@lousha-accessories.com\n📱 WhatsApp : +228 96 69 29 72\n🕐 Lun-Sam : 9h-19h"
        : "📧 bonjour@lousha-accessories.com\n📱 WhatsApp: +228 96 69 29 72\n🕐 Mon-Sat: 9am-7pm";
    }
    if (text.includes("merci") || text.includes("thank")) {
      return fr ? "Avec plaisir ! N'hésitez pas si vous avez d'autres questions. 🌿" : "You're welcome! Feel free to ask more. 🌿";
    }
    if (text.includes("bonjour") || text.includes("salut") || text.includes("hello") || text.includes("hi")) {
      return fr ? "Bonjour ! Comment puis-je vous aider aujourd'hui ?" : "Hello! How can I help you today?";
    }

    return fr
      ? "Je n'ai pas bien compris. Vous pouvez me demander sur les prix, la livraison, le raphia, nos produits, ou comment commander. Sinon, contactez-nous via WhatsApp !"
      : "I didn't quite understand. You can ask me about prices, delivery, raffia, our products, or how to order. Otherwise, contact us via WhatsApp!";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setMessages((m) => [...m, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      const response = getBotResponse(userMessage);
      setMessages((m) => [...m, { role: "bot", text: response }]);
      setLoading(false);
    }, 600);
  };

  const suggestions = lang === "fr"
    ? ["Quel sont vos prix ?", "Comment commander ?", "Dites-moi sur le raphia", "Vos contacts"]
    : ["What are your prices?", "How to order?", "Tell me about raffia", "Your contacts"];

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
            {lang === "fr" ? "En ligne" : "Online"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="h-72 overflow-y-auto scroll-elegant p-4 space-y-3 bg-secondary/20">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2.5 max-w-[85%]",
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <span
              className={cn(
                "h-7 w-7 rounded-full flex items-center justify-center shrink-0",
                msg.role === "bot" ? "bg-accent/10 text-accent" : "bg-foreground text-background"
              )}
            >
              {msg.role === "bot" ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
            </span>
            <div
              className={cn(
                "px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line",
                msg.role === "bot"
                  ? "bg-background border border-border rounded-tl-none"
                  : "bg-foreground text-background rounded-tr-none"
              )}
            >
              {msg.text}
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
            <button
              key={i}
              onClick={() => {
                setInput(s);
                setTimeout(() => {
                  setMessages((m) => [...m, { role: "user", text: s }]);
                  setInput("");
                  setLoading(true);
                  setTimeout(() => {
                    setMessages((m) => [...m, { role: "bot", text: getBotResponse(s) }]);
                    setLoading(false);
                  }, 600);
                }, 50);
              }}
              className="px-3 py-1.5 text-[11px] tracking-luxe-sm uppercase font-sans border border-border rounded-full hover:bg-secondary transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-border flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={lang === "fr" ? "Écrivez votre message..." : "Type your message..."}
          className="flex-1 h-10 bg-secondary/50 border border-border px-3 text-sm rounded-full focus:outline-none focus:border-accent transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-colors disabled:opacity-50 shrink-0"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
