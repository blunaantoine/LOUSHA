/**
 * Service Authentification — gestion des utilisateurs et mots de passe.
 *
 * - Hashing via crypto.scrypt (Node built-in, sécurisé, pas de dépendance).
 * - Prépare le terrain pour NextAuth (CredentialsProvider consomme ces fonctions).
 * - Rôle RBAC : "CUSTOMER" par défaut, "ADMIN" pour le back-office.
 */
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { generateResetToken } from "./email-service";

const SCRYPT_KEYLEN = 64;
const SCRYPT_SALTLEN = 16;

// Instance Prisma locale (lazy) — évite les problèmes de résolution de module
// dans le contexte NextAuth/Turbopack.
const g = globalThis as unknown as { _loushaAuthPrisma?: PrismaClient };
function getDb() {
  if (!g._loushaAuthPrisma) {
    g._loushaAuthPrisma = new PrismaClient();
  }
  return g._loushaAuthPrisma;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SCRYPT_SALTLEN);
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  // Format: "scrypt:salt:hash" en hexadécimal
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  // Comparaison à temps constant
  return crypto.timingSafeEqual(derived, expected);
}

export async function findUserByEmail(email: string) {
  return getDb().user.findUnique({ where: { email: email.toLowerCase() } });
}

export async function findUserById(id: string) {
  return getDb().user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, phone: true, role: true, blocked: true },
  });
}

export async function createUser({
  name,
  email,
  password,
  phone,
}: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const hashed = await hashPassword(password);
  return getDb().user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashed,
      phone: phone ?? null,
      role: "CUSTOMER",
    },
  });
}

export async function validateCredentials(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  // Compte bloqué par l'admin → connexion refusée
  if (user.blocked) return null;
  const ok = await verifyPassword(password, user.password);
  return ok ? user : null;
}

/* ============ Connexion avec Google ============ */

export type GoogleSignInResult =
  | { status: "ok"; userId: string }
  | { status: "password-account" }
  | { status: "blocked" };

/**
 * Trouve ou crée le compte associé à une adresse Google vérifiée.
 *
 * - Adresse inconnue : un compte client est créé, rattaché à Google. Son mot
 *   de passe est aléatoire et inutilisable (la connexion se fait par Google).
 * - Compte déjà créé par Google : connexion autorisée.
 * - Compte créé avec un mot de passe : la connexion Google est refusée. Les
 *   inscriptions par mot de passe ne vérifient pas l'adresse email ; rattacher
 *   automatiquement Google à un tel compte permettrait à quelqu'un qui aurait
 *   inscrit l'adresse d'une autre personne d'accéder ensuite à son compte.
 */
export async function findOrCreateGoogleUser({
  email,
  name,
}: {
  email: string;
  name?: string | null;
}): Promise<GoogleSignInResult> {
  const lower = email.toLowerCase();
  const db = getDb();

  let user = await db.user.findUnique({ where: { email: lower } });
  if (!user) {
    const password = await hashPassword(crypto.randomBytes(32).toString("hex"));
    const cleanName = (name ?? "").trim().slice(0, 100) || lower.split("@")[0];
    try {
      user = await db.user.create({
        data: {
          name: cleanName,
          email: lower,
          password,
          role: "CUSTOMER",
          authProvider: "google",
        },
      });
    } catch {
      // Deux connexions simultanées : le compte vient d'être créé par l'autre.
      user = await db.user.findUnique({ where: { email: lower } });
      if (!user) throw new Error("Création du compte Google impossible");
    }
  }

  if (user.blocked) return { status: "blocked" };
  if (user.authProvider !== "google") return { status: "password-account" };
  return { status: "ok", userId: user.id };
}

/* ============ Mot de passe oublié ============ */

/** Crée un token de reset et le sauvegarde en DB (expire dans 1h). */
export async function createPasswordReset(email: string) {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const token = generateResetToken();
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 heure
  await getDb().user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });
  return { user, token };
}

/** Vérifie qu'un token de reset est valide et non expiré. */
export async function verifyResetToken(token: string) {
  if (!token) return null;
  const user = await getDb().user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });
  return user;
}

/** Réinitialise le mot de passe avec un token valide. */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<boolean> {
  const user = await verifyResetToken(token);
  if (!user) return false;
  const hashed = await hashPassword(newPassword);
  await getDb().user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
  return true;
}
