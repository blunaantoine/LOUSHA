"use client";

import { Copy, ExternalLink, Mail, MapPin, MessageCircle, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { AdminOrder } from "@/hooks/use-admin-data";

const STATUSES = ["PENDING", "CONFIRMED", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

/** Valeurs de remplissage des commandes WhatsApp (pas d'adresse saisie). */
const isPlaceholder = (v: string | null | undefined) =>
  !v || v.trim() === "" || v.trim() === "—" || v === "Commande WhatsApp" || v === "Client WhatsApp";

/**
 * Fiche détaillée d'une commande (panneau admin) : client, livraison,
 * articles, paiement, et changement de statut.
 */
export function OrderDetailDialog({
  order,
  open,
  onOpenChange,
  statusLabel,
  statusStyles,
  onStatusChange,
}: {
  order: AdminOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statusLabel: (s: string) => string;
  statusStyles: Record<string, string>;
  onStatusChange: (orderId: string, status: string) => void;
}) {
  const { lang, currency } = useStore();
  const fr = lang === "fr";
  if (!order) return null;

  const ref = order.id.slice(-6).toUpperCase();
  const date = new Date(order.createdAt).toLocaleString(fr ? "fr-FR" : "en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
  const provider = order.payment?.provider;
  // Les commandes WhatsApp n'ont pas de paiement enregistré ni d'adresse saisie.
  const isWhatsApp = provider === "WHATSAPP" || (!order.payment && isPlaceholder(order.address));
  const providerLabel =
    provider === "PAYDUNYA"
      ? "PayDunya"
      : isWhatsApp
        ? fr ? "Commande WhatsApp" : "WhatsApp order"
        : provider || (fr ? "Aucun paiement" : "No payment");
  const paymentStatus: Record<string, [string, string]> = {
    SUCCESS: ["Payé", "Paid"],
    PENDING: ["En attente", "Pending"],
    FAILED: ["Échoué ou annulé", "Failed or cancelled"],
  };
  const payState = order.payment ? paymentStatus[order.payment.status] : null;
  const phone = order.phone || order.user?.phone || null;
  const phoneDigits = phone ? phone.replace(/[^0-9]/g, "") : "";
  const name = isPlaceholder(order.fullName) ? order.user?.name || null : order.fullName;
  const email = order.email || order.user?.email || null;
  const noAddress = isPlaceholder(order.address);
  const itemCount = order.items.reduce((n, i) => n + i.qty, 0);
  const price = (cents: number) => formatPrice(cents, lang, currency);

  const copy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(fr ? "Copié" : "Copied"))
      .catch(() => {});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 rounded-3xl overflow-hidden max-h-[92vh] overflow-y-auto scroll-elegant">
        {/* En-tête */}
        <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-border">
          <p className="text-[10px] tracking-luxe-sm uppercase text-muted-foreground">
            {fr ? "Commande" : "Order"} #{ref} · {date}
          </p>
          <DialogTitle className="font-serif text-2xl sm:text-3xl mt-2 pr-8 leading-tight">
            {name ||
              (isWhatsApp
                ? fr ? "Client WhatsApp" : "WhatsApp customer"
                : fr ? "Client sans nom" : "Unnamed customer")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {fr ? "Détails de la commande" : "Order details"}
          </DialogDescription>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <select
              value={order.status}
              onChange={(e) => onStatusChange(order.id, e.target.value)}
              aria-label={fr ? "Statut de la commande" : "Order status"}
              className={cn(
                "h-8 px-3 text-[10px] tracking-luxe-sm uppercase font-sans rounded-full border-0 cursor-pointer",
                statusStyles[order.status] || "bg-secondary"
              )}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
            <span
              className={cn(
                "px-3 py-1.5 rounded-full text-[10px] tracking-luxe-sm uppercase font-sans",
                isWhatsApp ? "bg-[#25D366]/10 text-[#1a9e4b]" : "bg-secondary text-foreground"
              )}
            >
              {providerLabel}
              {payState ? ` · ${fr ? payState[0] : payState[1]}` : ""}
            </span>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-6 grid sm:grid-cols-2 gap-6">
          {/* Client */}
          <section>
            <h3 className="text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-3">
              {fr ? "Client" : "Customer"}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>
                  {order.user
                    ? fr ? "Client avec un compte" : "Registered customer"
                    : fr ? "Commande sans compte" : "Guest order"}
                </span>
              </li>
              <li className="flex items-center gap-2.5 min-w-0">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                {email ? (
                  <a href={`mailto:${email}`} className="truncate hover:text-accent underline-offset-2 hover:underline">
                    {email}
                  </a>
                ) : (
                  <span className="text-muted-foreground">{fr ? "Non renseigné" : "Not provided"}</span>
                )}
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                {phone ? (
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <a href={`tel:${phone}`} className="hover:text-accent underline-offset-2 hover:underline">
                      {phone}
                    </a>
                    {phoneDigits.length >= 8 && (
                      <a
                        href={`https://wa.me/${phoneDigits}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#1a9e4b] hover:underline"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    )}
                  </span>
                ) : (
                  <span className="text-muted-foreground">{fr ? "Non renseigné" : "Not provided"}</span>
                )}
              </li>
            </ul>
          </section>

          {/* Livraison */}
          <section>
            <h3 className="text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-3">
              {fr ? "Livraison" : "Delivery"}
            </h3>
            <div className="flex items-start gap-2.5 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              {noAddress ? (
                <span className="text-muted-foreground">
                  {fr ? "Adresse à convenir avec le client (commande WhatsApp)." : "Address to agree with the customer (WhatsApp order)."}
                </span>
              ) : (
                <span className="leading-relaxed">
                  {order.address}
                  <br />
                  {[order.city, isPlaceholder(order.zip) ? null : order.zip].filter(Boolean).join(" ")}
                  {!isPlaceholder(order.country) && (
                    <>
                      <br />
                      {order.country}
                    </>
                  )}
                </span>
              )}
            </div>
          </section>
        </div>

        {/* Articles */}
        <section className="px-6 sm:px-8 pb-6">
          <h3 className="text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-3">
            {fr ? `Articles (${itemCount})` : `Items (${itemCount})`}
          </h3>
          <ul className="divide-y divide-border border-y border-border">
            {order.items.map((it) => (
              <li key={it.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="min-w-0">
                  <a
                    href={`/product/${it.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium hover:text-accent inline-flex items-center gap-1.5"
                  >
                    {it.name}
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {it.qty} × {price(it.priceCents)}
                  </p>
                </div>
                <span className="font-sans whitespace-nowrap">{price(it.priceCents * it.qty)}</span>
              </li>
            ))}
          </ul>
          {order.shippingCents > 0 && (
            <div className="flex justify-between text-sm pt-3 text-muted-foreground">
              <span>{fr ? "Livraison" : "Shipping"}</span>
              <span>{price(order.shippingCents)}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-3">
            <span className="font-serif text-lg">Total</span>
            <span className="font-serif text-xl">{price(order.totalCents)}</span>
          </div>
        </section>

        {/* Références */}
        <section className="px-6 sm:px-8 py-4 bg-secondary/40 border-t border-border text-xs text-muted-foreground space-y-1.5">
          <p className="flex flex-wrap items-center gap-2">
            {fr ? "N° complet" : "Full number"} : <code className="font-mono text-foreground">{order.id}</code>
            <button
              type="button"
              onClick={() => copy(order.id)}
              className="inline-flex items-center gap-1 hover:text-foreground"
              aria-label={fr ? "Copier le numéro" : "Copy number"}
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </p>
          {provider === "PAYDUNYA" && order.payment?.transactionId && (
            <p>
              {fr ? "Référence PayDunya" : "PayDunya reference"} :{" "}
              <code className="font-mono text-foreground">{order.payment.transactionId}</code>
            </p>
          )}
        </section>
      </DialogContent>
    </Dialog>
  );
}
