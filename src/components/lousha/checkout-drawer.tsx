"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useStore } from "@/lib/store";
import { useDict, formatPrice } from "@/lib/i18n";
import { X, ArrowLeft, Lock, ShieldCheck, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CheckoutDrawer() {
  const {
    lang,
    currency,
    checkoutOpen,
    setCheckoutOpen,
    setCartOpen,
    items: cartItems,
    directItems,
    paymentEnabled,
  } = useStore();
  // « Commander » depuis une fiche produit : uniquement ce produit.
  // « Passer commande » depuis le panier : tout le panier.
  const items = directItems ?? cartItems;
  const t = useDict(lang);
  const { data: session } = useSession();

  const [submitting, setSubmitting] = useState(false);
  // null = champ pas encore modifié : on affiche alors la valeur du compte
  // connecté (nom, e-mail, téléphone), sans écraser une saisie.
  type FormKey = "fullName" | "email" | "phone" | "address" | "city";
  const [edits, setEdits] = useState<Partial<Record<FormKey, string>>>({});
  const sessionUser = session?.user as { name?: string | null; email?: string | null; phone?: string } | undefined;
  const defaults: Record<FormKey, string> = {
    fullName: sessionUser?.name ?? "",
    email: sessionUser?.email ?? "",
    phone: sessionUser?.phone ?? "",
    address: "",
    city: "",
  };
  const form = Object.fromEntries(
    (Object.keys(defaults) as FormKey[]).map((k) => [k, edits[k] ?? defaults[k]])
  ) as Record<FormKey, string>;
  const update = (k: FormKey) => (v: string) => setEdits((e) => ({ ...e, [k]: v }));

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

  const subtotal = items.reduce((n, i) => n + i.qty * i.priceCents, 0);
  const total = subtotal;

  // Paiement en ligne : la commande est enregistrée puis le client est
  // redirigé vers la page de paiement PayDunya (Mobile Money, carte).
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || items.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/paydunya/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ slug: i.slug, priceCents: i.priceCents, qty: i.qty })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        toast.error(data.error || (lang === "fr" ? "Le paiement n'a pas pu être lancé." : "Payment could not be started."));
        setSubmitting(false);
        return;
      }
      // La page de retour ne videra le panier que si c'est lui qui a été payé.
      try {
        sessionStorage.setItem("lousha-checkout-source", directItems ? "direct" : "cart");
      } catch {
        // stockage indisponible : le panier ne sera simplement pas vidé
      }
      window.location.href = data.url;
    } catch {
      toast.error(lang === "fr" ? "Erreur réseau" : "Network error");
      setSubmitting(false);
    }
  };

  const close = () => setCheckoutOpen(false);

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
            {(
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

        {(
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
                      label={t.checkout.fullName}
                      required
                      className="col-span-2"
                      value={form.fullName}
                      onChange={update("fullName")}
                      autoComplete="name"
                    />
                    <Field
                      label={t.checkout.email}
                      type="email"
                      required
                      value={form.email}
                      onChange={update("email")}
                      autoComplete="email"
                    />
                    <Field
                      label={t.checkout.phone}
                      type="tel"
                      required
                      inputMode="tel"
                      placeholder="+228 ..."
                      value={form.phone}
                      onChange={update("phone")}
                      autoComplete="tel"
                    />
                  </div>
                </section>

                {/* Livraison */}
                <section>
                  <h3 className="font-serif text-lg mb-4">{t.checkout.shipping}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label={t.checkout.address}
                      required
                      className="col-span-2"
                      value={form.address}
                      onChange={update("address")}
                      autoComplete="street-address"
                    />
                    <Field
                      label={t.checkout.city}
                      required
                      className="col-span-2"
                      value={form.city}
                      onChange={update("city")}
                      autoComplete="address-level2"
                    />
                  </div>
                </section>

                {/* Paiement */}
                {paymentEnabled && (
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif text-lg">{t.checkout.payment}</h3>
                      <span className="inline-flex items-center gap-1.5 text-[11px] tracking-luxe-sm uppercase text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        PayDunya
                      </span>
                    </div>
                    <p className="flex items-start gap-2 text-sm text-muted-foreground font-light leading-relaxed">
                      <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
                      {t.checkout.note}
                    </p>
                  </section>
                )}
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
                      <li key={`${item.slug}:${item.priceCents}`} className="flex gap-3">
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

                {/* Paiement en ligne PayDunya (activable par l'admin) — toujours en XOF */}
                {paymentEnabled && (
                  <button
                    type="submit"
                    disabled={submitting || items.length === 0}
                    className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-4 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-60 rounded-full"
                  >
                    {submitting ? (
                      <>
                        <span className="h-4 w-4 border-2 border-background/40 border-t-background rounded-full animate-spin" />
                        {t.common.loading}
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        {t.checkout.payAmount(formatPrice(total, lang, "XOF"))}
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
  inputMode,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  className?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  inputMode?: "numeric" | "tel" | "email" | "text";
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
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
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full h-11 bg-background border border-border px-3 text-sm font-sans focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors rounded-xl"
      />
    </label>
  );
}
