"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useDict, formatPrice } from "@/lib/i18n";
import { X, ArrowLeft, Check, Lock, ShieldCheck, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CheckoutDrawer() {
  const {
    lang,
    currency,
    checkoutOpen,
    setCheckoutOpen,
    setCartOpen,
    items,
    cartTotal,
    clearCart,
    setView,
    paymentEnabled,
  } = useStore();
  const t = useDict(lang);

  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (checkoutOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [checkoutOpen]);

  const subtotal = cartTotal();
  const total = subtotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      clearCart();
      toast.success(t.checkout.success);
    }, 1400);
  };

  const close = () => {
    setCheckoutOpen(false);
    setTimeout(() => setDone(false), 300);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] transition-all duration-300",
        checkoutOpen ? "visible" : "invisible"
      )}
      aria-hidden={!checkoutOpen}
    >
      <div
        className={cn(
          "absolute inset-0 bg-foreground/50 backdrop-blur-sm transition-opacity duration-300",
          checkoutOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={close}
      />

      <aside
        className={cn(
          "absolute right-0 top-0 h-full w-full max-w-2xl bg-background shadow-2xl flex flex-col transition-transform duration-400 ease-out",
          checkoutOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label={t.checkout.title}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 h-16 border-b border-border">
          <div className="flex items-center gap-3">
            {!done && (
              <button
                onClick={() => {
                  setCheckoutOpen(false);
                  setCartOpen(true);
                }}
                className="p-1.5 hover:opacity-60 transition"
                aria-label={t.checkout.back}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="font-serif text-xl">{t.checkout.title}</h2>
          </div>
          <button
            onClick={close}
            className="p-2 hover:opacity-60 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
            <span className="h-20 w-20 rounded-full bg-accent/15 text-accent flex items-center justify-center">
              <Check className="h-9 w-9" strokeWidth={2} />
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl">
              {t.checkout.success}
            </h3>
            <p className="text-muted-foreground font-light max-w-md">
              {t.checkout.successText}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={() => {
                  close();
                  setView("home");
                }}
                className="inline-flex items-center justify-center bg-foreground text-background px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors rounded-full"
              >
                {t.checkout.backHome}
              </button>
              <button
                onClick={() => {
                  close();
                  setView("shop");
                }}
                className="inline-flex items-center justify-center border border-foreground text-foreground px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-foreground hover:text-background transition-colors rounded-full"
              >
                {t.checkout.backShop}
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto scroll-elegant"
          >
            <div className="grid lg:grid-cols-5">
              {/* Form fields */}
              <div className="lg:col-span-3 px-6 sm:px-8 py-8 space-y-8">
                <p className="text-[11px] tracking-luxe uppercase text-accent">
                  {t.checkout.subtitle}
                </p>

                {/* Contact */}
                <section>
                  <h3 className="font-serif text-lg mb-4">
                    {t.checkout.contact}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label={t.checkout.email}
                      type="email"
                      required
                      className="col-span-2"
                    />
                    <Field label={t.checkout.fullName} required />
                    <Field label={t.checkout.phone} type="tel" />
                  </div>
                </section>

                {/* Payment */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-lg">{t.checkout.payment}</h3>
                    <span className="inline-flex items-center gap-1.5 text-[11px] tracking-luxe-sm uppercase text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      SSL
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label={t.checkout.cardNumber}
                      required
                      className="col-span-2"
                      placeholder="4242 4242 4242 4242"
                      inputMode="numeric"
                    />
                    <Field
                      label={t.checkout.cardExpiry}
                      required
                      placeholder="MM/AA"
                    />
                    <Field
                      label={t.checkout.cardCvc}
                      required
                      placeholder="123"
                      inputMode="numeric"
                    />
                  </div>
                  <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground font-light">
                    <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
                    {t.checkout.note}
                  </p>
                </section>
              </div>

              {/* Summary */}
              <div className="lg:col-span-2 bg-secondary/40 border-t lg:border-t-0 lg:border-l border-border px-6 sm:px-8 py-8">
                <h3 className="font-serif text-lg mb-5">
                  {t.checkout.orderSummary}
                </h3>
                <ul className="flex flex-col gap-4 mb-5">
                  {items.map((item) => {
                    const name = lang === "fr" ? item.name : item.nameEn;
                    return (
                      <li key={item.slug} className="flex gap-3">
                        <div className="relative h-16 w-14 shrink-0 bg-background overflow-hidden">
                          <img
                            src={item.image}
                            alt={name}
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full bg-foreground text-background text-[10px] font-sans flex items-center justify-center">
                            {item.qty}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans font-medium text-sm leading-tight">
                            {name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatPrice(item.priceCents * item.qty, lang, currency)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t.cart.subtotal}
                    </span>
                    <span>{formatPrice(subtotal, lang, currency)}</span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex items-center justify-between font-serif text-lg">
                    <span>{t.cart.total}</span>
                    <span>{formatPrice(total, lang, currency)}</span>
                  </div>
                </div>

                {/* Bouton de paiement carte (masquable par l'admin) */}
                {paymentEnabled && (
                  <button
                    type="submit"
                    disabled={submitting || items.length === 0}
                    className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-4 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-60 rounded-full rounded-full"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 border-2 border-background/40 border-t-background rounded-full animate-spin" />
                        {t.common.loading}
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        {t.checkout.payAmount(formatPrice(total, lang, currency))}
                      </>
                    )}
                  </button>
                )}

                {/* Bouton commande WhatsApp (toujours visible) — sauvegarde en DB */}
                <button
                  type="button"
                  onClick={async () => {
                    const WHATSAPP_NUMBER = "22896692972";

                    // Sauvegarde la commande en DB
                    try {
                      await fetch("/api/orders/whatsapp", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          items: items.map((i) => ({
                            slug: i.slug,
                            name: i.name,
                            priceCents: i.priceCents,
                            qty: i.qty,
                          })),
                          fullName: "Client WhatsApp",
                          email: "",
                          source: "checkout",
                        }),
                      });
                    } catch {
                      // Ignore — on ouvre WhatsApp quand même
                    }

                    const itemsList = items.map((i) => {
                      const n = lang === "fr" ? i.name : i.nameEn;
                      return `• ${n} ×${i.qty} — ${formatPrice(i.priceCents * i.qty, lang, currency)}`;
                    }).join("\n");
                    const msg = lang === "fr"
                      ? `Bonjour Lousha Accessories 👋\n\nJe souhaite commander :\n\n${itemsList}\n\n💰 Total : ${formatPrice(total, lang, currency)}\n\nMerci de me confirmer la disponibilité et les modalités.`
                      : `Hello Lousha Accessories 👋\n\nI'd like to order:\n\n${itemsList}\n\n💰 Total: ${formatPrice(total, lang, currency)}\n\nPlease confirm availability and payment details.`;
                    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
                  }}
                  disabled={items.length === 0}
                  className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-4 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-[#1eb858] transition-colors disabled:opacity-60 rounded-full"
                >
                  <MessageCircle className="h-4 w-4" />
                  {lang === "fr" ? "Commander sur WhatsApp" : "Order on WhatsApp"}
                </button>
              </div>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}

function Field({
  label,
  className,
  type = "text",
  required,
  placeholder,
  defaultValue,
  inputMode,
}: {
  label: string;
  className?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
}) {
  return (
    <label className={cn("block", className)}>
      <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        inputMode={inputMode}
        className="w-full h-11 bg-background border border-border px-3 text-sm font-sans focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors rounded-xl"
      />
    </label>
  );
}
