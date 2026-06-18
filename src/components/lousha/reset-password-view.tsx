"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { ArrowRight, Lock, Eye, EyeOff, Check } from "lucide-react";
import { toast } from "sonner";

export function ResetPasswordView() {
  const { lang, setView, resetToken, setResetToken } = useStore();
  const t = useDict(lang);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);

  // Vérifie la validité du token au montage
  useEffect(() => {
    if (!resetToken) {
      setValidToken(false);
      return;
    }
    let active = true;
    fetch(`/api/auth/reset-password?token=${resetToken}`)
      .then((r) => r.json())
      .then((d) => {
        if (active) setValidToken(d.valid === true);
      })
      .catch(() => active && setValidToken(false));
    return () => {
      active = false;
    };
  }, [resetToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error(lang === "fr" ? "Les mots de passe ne correspondent pas." : "Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      toast.error(lang === "fr" ? "6 caractères minimum." : "6 characters minimum.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t.auth.resetInvalid);
        return;
      }
      toast.success(t.auth.resetSuccess);
      setResetToken(null);
      setView("auth");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  // Token invalide
  if (validToken === false) {
    return (
      <section className="min-h-[70vh] py-16 sm:py-24 bg-background flex items-center">
        <div className="mx-auto max-w-md w-full px-4 sm:px-6 text-center">
          <h1 className="font-serif text-3xl text-foreground mb-4">
            {t.auth.resetInvalid}
          </h1>
          <button
            onClick={() => {
              setResetToken(null);
              setView("auth");
            }}
            className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors rounded-full"
          >
            {t.auth.backToLogin}
          </button>
        </div>
      </section>
    );
  }

  // Chargement de la vérification du token
  if (validToken === null) {
    return (
      <section className="min-h-[70vh] flex items-center justify-center">
        <span className="h-6 w-6 border-2 border-border border-t-accent rounded-full animate-spin" />
      </section>
    );
  }

  return (
    <section className="min-h-[70vh] py-16 sm:py-24 bg-background flex items-center">
      <div className="mx-auto max-w-md w-full px-4 sm:px-6">
        <div className="text-center mb-8">
          <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
            Lousha Accessories
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground">
            {t.auth.resetTitle}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground font-light">
            {t.auth.resetText}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nouveau mot de passe */}
          <label className="block">
            <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
              {t.auth.newPassword}
              <span className="text-accent"> *</span>
            </span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-background border border-border pl-10 pr-11 text-sm font-sans focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {/* Confirmation */}
          <label className="block">
            <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
              {t.auth.confirmPassword}
              <span className="text-accent"> *</span>
            </span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {password && confirm && password === confirm ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full h-12 bg-background border border-border pl-10 pr-3 text-sm font-sans focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors rounded-xl"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={loading || !password || !confirm || password !== confirm}
            className="group w-full inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors rounded-full disabled:opacity-60"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-background/40 border-t-background rounded-full animate-spin" />
            ) : (
              <>
                {t.auth.resetBtn}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
