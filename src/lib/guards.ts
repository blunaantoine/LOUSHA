import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Vérifie que la requête provient d'un membre du staff (ADMIN ou MANAGER).
 * Utilisé pour les routes de gestion catalogue/commandes/carrousel.
 */
export async function requireStaff(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;
  const role = (session.user as { role?: string }).role;
  return role === "ADMIN" || role === "MANAGER";
}

/**
 * Vérifie que la requête provient d'un administrateur (ADMIN uniquement).
 * Utilisé pour la gestion des utilisateurs et les opérations sensibles.
 */
export async function requireAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session?.user && (session.user as { role?: string }).role === "ADMIN";
}

/**
 * Retourne le rôle de l'utilisateur connecté (ou null si non authentifié).
 */
export async function getCurrentRole(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user ? (session.user as { role?: string }).role ?? null : null;
}
