import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Retourne le rôle réel de l'utilisateur connecté, relu en base de données
 * à chaque requête (ou null si non authentifié, supprimé ou bloqué).
 *
 * Le rôle n'est jamais lu depuis le jeton de session : un changement de rôle,
 * un blocage ou une suppression de compte prend donc effet immédiatement.
 */
export async function getCurrentRole(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return null;
  const user = await db.user.findUnique({
    where: { id },
    select: { role: true, blocked: true },
  });
  if (!user || user.blocked) return null;
  return user.role;
}

/**
 * Vérifie que la requête provient d'un membre du staff (ADMIN ou MANAGER).
 * Utilisé pour les routes de gestion catalogue/commandes/carrousel.
 */
export async function requireStaff(): Promise<boolean> {
  const role = await getCurrentRole();
  return role === "ADMIN" || role === "MANAGER";
}

/**
 * Vérifie que la requête provient d'un administrateur (ADMIN uniquement).
 * Utilisé pour la gestion des utilisateurs et les opérations sensibles.
 */
export async function requireAdmin(): Promise<boolean> {
  return (await getCurrentRole()) === "ADMIN";
}
