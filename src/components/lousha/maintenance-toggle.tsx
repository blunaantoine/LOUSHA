"use client";

import { useContext, useEffect, useState } from "react";
import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type Status = { enabled: boolean; pinConfigured: boolean };

/** Prévient le reste du site (bandeau admin) qu'un réglage a changé. */
export const SETTINGS_CHANGED_EVENT = "lousha:settings-changed";

/**
 * Carte « Mode maintenance » du tableau de bord, visible seulement par les
 * comptes autorisés (voir requireMaintenanceManager).
 * Activer ou désactiver demande un code à 4 chiffres, créé à la première
 * utilisation.
 */
export function MaintenanceToggle() {
  const { lang } = useStore();
  const fr = lang === "fr";
  const [status, setStatus] = useState<Status | null>(null);
  const [open, setOpen] = useState(false);
  // Nouvelle clé à chaque ouverture : la fenêtre repart de champs vides.
  const [dialogKey, setDialogKey] = useState(0);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/maintenance", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Status | null) => {
        if (active && d) setStatus(d);
      })
      .catch(() => {
        // carte masquée si l'état ne peut pas être lu
      });
    return () => {
      active = false;
    };
  }, []);

  // La route répond 403 aux comptes non autorisés : la carte reste cachée.
  if (!status) return null;

  const on = status.enabled;

  return (
    <>
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 shadow-sm",
          on ? "border-amber-300 bg-amber-50" : "border-border bg-background"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
              on ? "bg-amber-200 text-amber-800" : "bg-muted text-muted-foreground"
            )}
          >
            <Wrench className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="font-sans text-sm font-medium leading-tight">
              {fr ? "Mode maintenance" : "Maintenance mode"}
            </p>
            <p className={cn("text-xs mt-0.5 leading-snug", on ? "text-amber-800" : "text-muted-foreground")}>
              {on
                ? fr
                  ? "Activé — le site est fermé aux visiteurs. Les administrateurs y ont toujours accès."
                  : "On — the site is closed to visitors. Administrators still have access."
                : fr
                  ? "Désactivé — le site est ouvert à tous."
                  : "Off — the site is open to everyone."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setDialogKey((k) => k + 1);
            setOpen(true);
          }}
          className={cn(
            "shrink-0 inline-flex items-center justify-center px-5 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans rounded-full transition-colors",
            on
              ? "bg-foreground text-background hover:bg-accent hover:text-accent-foreground"
              : "border border-amber-400 text-amber-800 hover:bg-amber-100"
          )}
        >
          {on
            ? fr ? "Rouvrir le site" : "Reopen the site"
            : fr ? "Activer la maintenance" : "Enable maintenance"}
        </button>
      </div>

      <PinDialog
        key={dialogKey}
        open={open}
        onOpenChange={setOpen}
        target={!on}
        pinConfigured={status.pinConfigured}
        onDone={(next) => {
          setStatus(next);
          window.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT));
        }}
      />
    </>
  );
}

function PinDialog({
  open,
  onOpenChange,
  target,
  pinConfigured,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** true = activer la maintenance, false = rouvrir le site */
  target: boolean;
  pinConfigured: boolean;
  onDone: (status: Status) => void;
}) {
  const { lang } = useStore();
  const fr = lang === "fr";
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const creating = !pinConfigured;
  const ready = creating ? pin.length === 4 && confirm.length === 4 : pin.length === 4;

  const submit = async () => {
    if (!ready || saving) return;
    if (creating && pin !== confirm) {
      setError(fr ? "Les deux codes ne correspondent pas." : "The two codes do not match.");
      setConfirm("");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          creating ? { enabled: target, newPin: pin, confirmPin: confirm } : { enabled: target, pin }
        ),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const messages: Record<string, [string, string]> = {
          PIN_WRONG: ["Code incorrect.", "Wrong code."],
          TOO_MANY: [
            "Trop d'essais. Réessayez dans 15 minutes.",
            "Too many attempts. Try again in 15 minutes.",
          ],
          PIN_FORMAT: ["Le code doit contenir 4 chiffres.", "The code must have 4 digits."],
          PIN_MISMATCH: ["Les deux codes ne correspondent pas.", "The two codes do not match."],
        };
        const m = messages[data.code as string];
        setError(m ? (fr ? m[0] : m[1]) : data.error || (fr ? "Échec" : "Failed"));
        setPin("");
        setConfirm("");
        return;
      }
      onDone({ enabled: data.enabled, pinConfigured: true });
      toast.success(
        target
          ? fr ? "Maintenance activée : le site est fermé aux visiteurs" : "Maintenance on: site closed to visitors"
          : fr ? "Le site est de nouveau ouvert" : "The site is open again"
      );
      onOpenChange(false);
    } catch {
      setError(fr ? "Erreur réseau" : "Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8 gap-0">
        <DialogTitle className="font-serif text-xl sm:text-2xl leading-tight">
          {target
            ? fr ? "Activer la maintenance" : "Enable maintenance"
            : fr ? "Rouvrir le site" : "Reopen the site"}
        </DialogTitle>
        <DialogDescription className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {target
            ? fr
              ? "Les visiteurs verront une page « maintenance en cours » et ne pourront plus commander. Vous et les autres administrateurs garderez l'accès au site."
              : "Visitors will see a “maintenance” page and won't be able to order. You and other administrators keep access to the site."
            : fr
              ? "Le site redeviendra accessible à tous les visiteurs."
              : "The site will be accessible to all visitors again."}
        </DialogDescription>

        <form
          className="mt-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <PinField
            label={
              creating
                ? fr ? "Choisissez un code à 4 chiffres" : "Choose a 4-digit code"
                : fr ? "Code à 4 chiffres" : "4-digit code"
            }
            value={pin}
            onChange={(v) => {
              setPin(v);
              setError(null);
            }}
            autoFocus
            disabled={saving}
          />
          {creating && (
            <>
              <PinField
                label={fr ? "Confirmez le code" : "Confirm the code"}
                value={confirm}
                onChange={(v) => {
                  setConfirm(v);
                  setError(null);
                }}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {fr
                  ? "Ce code sera demandé à chaque activation et désactivation. Notez-le : il ne pourra pas être affiché."
                  : "This code will be asked each time you turn maintenance on or off. Write it down: it can't be displayed."}
              </p>
            </>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="px-5 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans border border-border rounded-full hover:bg-secondary disabled:opacity-50"
            >
              {fr ? "Annuler" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={!ready || saving}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 text-[11px] tracking-luxe-sm uppercase font-sans rounded-full disabled:opacity-50",
                target
                  ? "bg-amber-600 text-white hover:bg-amber-700"
                  : "bg-foreground text-background hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {target ? (fr ? "Activer" : "Enable") : (fr ? "Rouvrir" : "Reopen")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PinField({
  label,
  value,
  onChange,
  autoFocus,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-2">{label}</p>
      <OTPInput
        maxLength={4}
        value={value}
        onChange={onChange}
        pattern={REGEXP_ONLY_DIGITS}
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        disabled={disabled}
        aria-label={label}
        containerClassName="flex items-center gap-2 has-disabled:opacity-50"
      >
        <PinSlots />
      </OTPInput>
    </div>
  );
}

/** 4 cases ; les chiffres saisis sont masqués par des points. */
function PinSlots() {
  const ctx = useContext(OTPInputContext);
  return (
    <>
      {ctx.slots.map((slot, i) => (
        <div
          key={i}
          className={cn(
            "relative flex h-12 w-12 items-center justify-center rounded-xl border text-2xl transition-all",
            slot.isActive ? "border-foreground ring-2 ring-foreground/15" : "border-border"
          )}
        >
          {slot.char ? "•" : null}
          {slot.hasFakeCaret && (
            <span className="pointer-events-none absolute h-5 w-px animate-pulse bg-foreground" />
          )}
        </div>
      ))}
    </>
  );
}
