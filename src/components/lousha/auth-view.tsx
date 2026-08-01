"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, User, Mail, Lock, Phone, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export function AuthView() {
  const { lang } = useStore();
  const t = useDict(lang);
  const { login, register, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let ok = false;
    if (mode === "login") {
      ok = await login(form.email, form.password);
    } else {
      ok = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
      });
    }
    if (ok) router.push("/account");
  };

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <section className="min-h-[70vh] py-16 sm:py-24 bg-background flex items-center">
      <div className="mx-auto max-w-md w-full px-4 sm:px-6">
        <div className="text-center mb-8">
          <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
            Lousha Accessories
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground">
            {mode === "login" ? t.auth.loginTitle : t.auth.registerTitle}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex border border-border rounded-full p-1 mb-8">
          <button
            onClick={() => setMode("login")}
            className={cn(
              "flex-1 py-2.5 text-[12px] tracking-luxe-sm uppercase font-sans rounded-full transition-colors",
              mode === "login"
                ? "bg-foreground text-background"
                : "text-foreground/70 hover:text-foreground"
            )}
          >
            {t.auth.loginTab}
          </button>
          <button
            onClick={() => setMode("register")}
            className={cn(
              "flex-1 py-2.5 text-[12px] tracking-luxe-sm uppercase font-sans rounded-full transition-colors",
              mode === "register"
                ? "bg-foreground text-background"
                : "text-foreground/70 hover:text-foreground"
            )}
          >
            {t.auth.registerTab}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <Field
              icon={<User className="h-4 w-4" />}
              label={t.auth.name}
              value={form.name}
              onChange={(v) => update("name", v)}
              required
            />
          )}
          <Field
            icon={<Mail className="h-4 w-4" />}
            label={t.auth.email}
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
            required
          />
          {/* Champ mot de passe avec bouton "voir/masquer" */}
          <label className="block">
            <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
              {t.auth.password}
              <span className="text-accent"> *</span>
            </span>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                autoComplete="new-password"
                className="w-full h-12 bg-background border border-border pl-10 pr-11 text-sm font-sans focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
          {mode === "register" && (
            <Field
              icon={<Phone className="h-4 w-4" />}
              label={t.auth.phone}
              type="tel"
              value={form.phone}
              onChange={(v) => update("phone", v)}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="group w-full inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors rounded-full disabled:opacity-60"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-background/40 border-t-background rounded-full animate-spin" />
            ) : (
              <>
                {mode === "login" ? t.auth.loginBtn : t.auth.registerBtn}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Lien mot de passe oublié (login uniquement) */}
        {mode === "login" && (
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push("/auth/forgot-password")}
              className="text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              {t.auth.forgotPassword}
            </button>
          </div>
        )}

        {/* Switch CTA */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? t.auth.noAccount : t.auth.haveAccount}{" "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-accent hover:underline font-medium"
          >
            {mode === "login" ? t.auth.registerCta : t.auth.loginCta}
          </button>
        </p>
      </div>
    </section>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 bg-background border border-border pl-10 pr-3 text-sm font-sans focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors rounded-xl"
        />
      </div>
    </label>
  );
}
