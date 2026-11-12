import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import {
  validateCredentials,
  findUserById,
  findUserByEmail,
  findOrCreateGoogleUser,
} from "@/lib/services/auth-service";
import { clientIp } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Configuration NextAuth — stratégie JWT + cookies HttpOnly.
 *
 * Le CredentialsProvider délègue la vérification au auth-service (scrypt).
 * Le callback JWT enrichit le token avec le rôle (RBAC) et l'id utilisateur.
 * Le callback session expose ces champs côté client.
 *
 * IMPORTANT : le callback JWT relit l'utilisateur en base à chaque lecture de
 * session. Le rôle et le statut « bloqué » ne viennent donc jamais du client.
 */
// La connexion Google n'est proposée que si les deux clés sont configurées
// (GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans le fichier .env du serveur).
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const googleAuthEnabled = !!GOOGLE_CLIENT_ID && !!GOOGLE_CLIENT_SECRET;

export const authOptions: NextAuthOptions = {
  // Pages du site (et non les pages par défaut de NextAuth), y compris pour
  // afficher une erreur de connexion Google.
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  cookies: {
    sessionToken: {
      // En production HTTPS, on préfixe par "__Host-" (plus sécurisé, exige
      // secure + path=/ + pas de domain). En dev, nom simple.
      name:
        process.env.NODE_ENV === "production"
          ? `__Host-next-auth.session-token`
          : `next-auth.session-token`,
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
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          // Anti force brute : 10 tentatives / 15 min par IP,
          // et 10 tentatives / 15 min par adresse email visée.
          const ip = clientIp(req?.headers);
          const emailKey = String(credentials.email).toLowerCase().slice(0, 254);
          const window = 15 * 60 * 1000;
          const ipOk = await rateLimit(`login:ip:${ip}`, 10, window);
          const emailOk = await rateLimit(`login:email:${emailKey}`, 10, window);
          if (!ipOk || !emailOk) {
            console.warn("[auth] trop de tentatives de connexion depuis", ip);
            return null;
          }
          const user = await validateCredentials(
            credentials.email,
            credentials.password
          );
          if (!user) {
            return null;
          }
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone ?? undefined,
          };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
    ...(googleAuthEnabled
      ? [
          GoogleProvider({
            clientId: GOOGLE_CLIENT_ID as string,
            clientSecret: GOOGLE_CLIENT_SECRET as string,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // Connexion par mot de passe : déjà vérifiée dans authorize().
      if (account?.provider !== "google") return true;

      const p = profile as
        | { email?: string; email_verified?: boolean; name?: string }
        | undefined;
      // Seules les adresses vérifiées par Google sont acceptées.
      if (!p?.email || p.email_verified !== true) {
        return "/auth/login?error=google";
      }
      try {
        const result = await findOrCreateGoogleUser({ email: p.email, name: p.name });
        if (result.status === "password-account") {
          return "/auth/login?error=google-password-account";
        }
        if (result.status === "blocked") return "/auth/login?error=google";
        return true;
      } catch (err) {
        console.error("[auth] google signIn error:", err);
        return "/auth/login?error=google";
      }
    },
    async jwt({ token, user, account }) {
      if (user && account?.provider === "google") {
        // Connexion Google : l'identité du jeton est celle du compte en base
        // (retrouvé par l'adresse vérifiée), jamais l'identifiant Google.
        const dbUser = user.email ? await findUserByEmail(user.email) : null;
        if (!dbUser || dbUser.blocked || dbUser.authProvider !== "google") return {};
        return {
          sub: dbUser.id,
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          phone: dbUser.phone ?? undefined,
        };
      }
      if (user) {
        // À la connexion : enrichir le token avec id, rôle et téléphone
        token.id = (user as { id: string }).id;
        token.role = (user as { role: string }).role;
        token.phone = (user as { phone?: string }).phone;
        return token;
      }

      // À chaque lecture de session (et quand le client appelle update()) :
      // les données sont relues en base. Rien de ce que le navigateur envoie
      // n'est recopié dans le jeton — en particulier jamais le rôle.
      // Un compte supprimé ou bloqué perd sa session immédiatement.
      if (!token.id) return {};
      const dbUser = await findUserById(token.id as string);
      if (!dbUser || dbUser.blocked) return {};
      token.name = dbUser.name;
      token.email = dbUser.email;
      token.role = dbUser.role;
      token.phone = dbUser.phone ?? undefined;
      return token;
    },
    async session({ session, token }) {
      if (!token.id) {
        // Jeton invalidé (compte supprimé ou bloqué) : aucune identité exposée.
        return { expires: session.expires } as typeof session;
      }
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { phone?: string }).phone = token.phone as string;
      }
      return session;
    },
  },
  // On gère l'UI d'auth via la vue Zustand "auth" — pas de redirection NextAuth
  // qui pourrait causer des boucles de rechargement.
};
