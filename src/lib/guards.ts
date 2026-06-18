import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Vérifie que la requête provient d'un administrateur.
 * Retourne true si l'utilisateur est connecté avec le rôle ADMIN.
 */
export async function requireAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session?.user && (session.user as { role?: string }).role === "ADMIN";
}
