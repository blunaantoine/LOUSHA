"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Clock, X, MessageCircle } from "lucide-react";
import { AppShell } from "@/components/lousha/app-shell";
import { useStore } from "@/lib/store";

type State = "checking" | "PAID" | "CANCELLED" | "PENDING" | "error";

const WHATSAPP_NUMBER = "22896692972";

/**
 * Page de retour après un paiement PayDunya.
 * L'état affiché vient du serveur, qui le vérifie directement auprès de
 * PayDunya : revenir sur cette page ne suffit pas à valider une commande.
 */
function ResultContent() {
  const params = useSearchParams();
  const orderId = params.get("order");
  const { lang, clearCart } = useStore();
  const fr = lang === "fr";
  const [state, setState] = useState<State>(orderId ? "checking" : "error");

  useEffect(() => {
    if (!orderId) return;
    let active = true;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    const check = async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/payments/paydunya/status?order=${encodeURIComponent(orderId)}`, {
          cache: "no-store",
        });
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        if (!res.ok) {
          setState("error");
          return;
        }
        if (data.status === "PAID") {
          clearCart();
          setState("PAID");
          return;
        }
        if (data.status === "CANCELLED") {
          setState("CANCELLED");
          return;
        }
        // Paiement pas encore confirmé (Mobile Money parfois lent) : on réessaie.
        if (attempts < 8) {
          timer = setTimeout(check, 4000);
        } else {
          setState("PENDING");
        }
      } catch {
        if (!active) return;
        if (attempts < 8) timer = setTimeout(check, 4000);
        else setState("PENDING");
      }
    };
    check();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [orderId, clearCart]);

  const ref = orderId ? orderId.slice(-8).toUpperCase() : "";
  const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    fr ? `Bonjour, à propos de ma commande ${ref}` : `Hello, about my order ${ref}`
  )}`;

  const view: Record<State, { icon: React.ReactNode; tone: string; title: string; text: string }> = {
    checking: {
      icon: <span className="h-8 w-8 border-2 border-border border-t-foreground rounded-full animate-spin" />,
      tone: "bg-secondary",
      title: fr ? "Vérification du paiement…" : "Checking your payment…",
      text: fr ? "Merci de patienter quelques secondes." : "Please wait a few seconds.",
    },
    PAID: {
      icon: <Check className="h-9 w-9" strokeWidth={2} />,
      tone: "bg-accent/15 text-accent",
      title: fr ? "Paiement confirmé" : "Payment confirmed",
      text: fr
        ? `Merci ! Votre commande ${ref} est payée. Nous vous contactons très vite pour la livraison.`
        : `Thank you! Your order ${ref} is paid. We will contact you shortly about delivery.`,
    },
    PENDING: {
      icon: <Clock className="h-9 w-9" strokeWidth={1.75} />,
      tone: "bg-amber-100 text-amber-700",
      title: fr ? "Paiement en cours de confirmation" : "Payment being confirmed",
      text: fr
        ? `Votre paiement n'est pas encore confirmé par l'opérateur. Si vous avez bien payé, la commande ${ref} sera validée automatiquement. En cas de doute, écrivez-nous sur WhatsApp.`
        : `Your payment is not confirmed by the operator yet. If you paid, order ${ref} will be validated automatically. If in doubt, message us on WhatsApp.`,
    },
    CANCELLED: {
      icon: <X className="h-9 w-9" strokeWidth={2} />,
      tone: "bg-destructive/10 text-destructive",
      title: fr ? "Paiement annulé" : "Payment cancelled",
      text: fr
        ? "Aucun montant n'a été débité. Votre panier est conservé : vous pouvez réessayer ou commander par WhatsApp."
        : "Nothing was charged. Your cart is kept: you can try again or order on WhatsApp.",
    },
    error: {
      icon: <X className="h-9 w-9" strokeWidth={2} />,
      tone: "bg-destructive/10 text-destructive",
      title: fr ? "Commande introuvable" : "Order not found",
      text: fr
        ? "Nous n'avons pas retrouvé cette commande. Contactez-nous sur WhatsApp si vous avez été débité."
        : "We could not find this order. Contact us on WhatsApp if you were charged.",
    },
  };
  const v = view[state];

  return (
    <section className="min-h-[60vh] py-20 sm:py-28 flex items-center">
      <div className="mx-auto max-w-lg w-full px-4 sm:px-6 text-center flex flex-col items-center gap-6">
        <span className={`h-20 w-20 rounded-full flex items-center justify-center ${v.tone}`}>{v.icon}</span>
        <h1 className="font-serif text-3xl sm:text-4xl text-foreground">{v.title}</h1>
        <p className="text-muted-foreground font-light leading-relaxed">{v.text}</p>
        {state !== "checking" && (
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-foreground text-background px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors rounded-full"
            >
              {state === "PAID"
                ? fr ? "Continuer mes achats" : "Continue shopping"
                : fr ? "Retour à la boutique" : "Back to shop"}
            </Link>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-[#1eb858] transition-colors rounded-full"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export default function CheckoutResultPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <ResultContent />
      </Suspense>
    </AppShell>
  );
}
