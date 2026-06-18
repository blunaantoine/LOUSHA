"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

/**
 * Hook d'authentification Lousha.
 *
 * Wrap next-auth/react avec une API simplifiée :
 * - `user`, `status` (loading/authenticated/unauthenticated)
 * - `login(email, password)` via Credentials
 * - `register({name, email, password, phone})` puis login automatique
 * - `logout()`
 *
 * Gère aussi les toasts de succès/erreur.
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!res || res.error) {
        toast.error("Email ou mot de passe incorrect.");
        return false;
      }
      toast.success("Connexion réussie. Bienvenue !");
      return true;
    } catch {
      toast.error("Erreur de connexion.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok) {
          toast.error(json.error || "Inscription impossible.");
          return false;
        }
        // Login automatique après inscription
        const ok = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });
        if (!ok || ok.error) {
          toast.success("Compte créé. Connectez-vous.");
          return true;
        }
        toast.success("Compte créé. Bienvenue !");
        return true;
      } catch {
        toast.error("Erreur lors de l'inscription.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    toast.success("Déconnecté.");
  }, []);

  return {
    session,
    user: session?.user,
    status, // "loading" | "authenticated" | "unauthenticated"
    loading,
    login,
    register,
    logout,
  };
}
