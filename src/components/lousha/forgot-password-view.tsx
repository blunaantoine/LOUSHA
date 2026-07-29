"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { useDict } from "@/lib/i18n";
import { ArrowRight, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ForgotPasswordView() {
  const { lang } = useStore();
  const t = useDict(lang);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
      toast.success(t.auth.forgotSent);
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[70vh] py-16 sm:py-24 bg-background flex items-center">
      <div className="mx-auto max-w-md w-full px-4 sm:px-6">
        <div className="text-center mb-8">
          <p className="text-[11px] tracking-luxe uppercase text-accent mb-3">
            Lousha Accessories
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl text-foreground">
            {t.auth.forgotTitle}
          </h1>
        </div>

        {sent ? (
          <div className="text-center space-y-6">
            <div className="p-6 border border-border rounded-2xl bg-secondary/30">
              <p className="text-sm text-foreground font-light leading-relaxed">
                {t.auth.forgotSent}
              </p>
            </div>
            <button
              onClick={() => router.push("/auth/login")}
              className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-3 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-foreground hover:text-background transition-colors rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.auth.backToLogin}
            </button>
          </div>
        ) : (
          <>
            <p className="text-center text-sm text-muted-foreground font-light mb-8">
              {t.auth.forgotText}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="block text-[10px] tracking-luxe-sm uppercase text-muted-foreground mb-1.5">
                  {t.auth.email}
                  <span className="text-accent"> *</span>
                </span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 bg-background border border-border pl-10 pr-3 text-sm font-sans focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors rounded-xl"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="group w-full inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3.5 text-[12px] tracking-luxe-sm uppercase font-sans hover:bg-accent hover:text-accent-foreground transition-colors rounded-full disabled:opacity-60"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-background/40 border-t-background rounded-full animate-spin" />
                ) : (
                  <>
                    {t.auth.forgotBtn}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push("/auth/login")}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t.auth.backToLogin}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
