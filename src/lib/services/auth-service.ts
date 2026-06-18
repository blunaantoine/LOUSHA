/**
 * Service Authentification — gestion des utilisateurs et mots de passe.
 *
 * - Hashing via crypto.scrypt (Node built-in, sécurisé, pas de dépendance).
 * - Prépare le terrain pour NextAuth (CredentialsProvider consomme ces fonctions).
 * - Rôle RBAC : "CUSTOMER" par défaut, "ADMIN" pour le back-office.
 */
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

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
