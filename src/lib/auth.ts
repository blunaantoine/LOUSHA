import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { validateCredentials } from "@/lib/services/auth-service";

/**
 * Configuration NextAuth — stratégie JWT + cookies HttpOnly.
 *
 * Le CredentialsProvider délègue la vérification au auth-service (scrypt).
 * Le callback JWT enrichit le token avec le rôle (RBAC) et l'id utilisateur.
 * Le callback session expose ces champs côté client.
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("[auth] missing credentials");
            return null;
          }
          const user = await validateCredentials(
            credentials.email,
            credentials.password
          );
          if (!user) {
            console.log("[auth] invalid credentials for", credentials.email);
            return null;
          }
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          } as { id: string; name: string; email: string; role: string };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  // On gère l'UI d'auth via la vue Zustand "auth" — pas de redirection NextAuth
  // qui pourrait causer des boucles de rechargement.
};
