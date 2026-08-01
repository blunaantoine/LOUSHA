/**
 * Script de diagnostic et réinitialisation du compte admin Lousha.
 *
 * Utilisation (depuis /var/www/lousha sur le VPS) :
 *   bun run scripts/reset-admin.ts
 *
 * Ce script :
 * 1. Vérifie si le compte admin existe
 * 2. Vérifie si le compte est bloqué
 * 3. Affiche les infos du compte
 * 4. Propose de réinitialiser le mot de passe et/ou débloquer le compte
 */

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import * as readline from "readline";

const prisma = new PrismaClient();

const SCRYPT_KEYLEN = 64;
const SCRYPT_SALTLEN = 16;

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SCRYPT_SALTLEN);
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("\n🔧 LOUSHA — Diagnostic & Réinitialisation Admin\n");
  console.log("=".repeat(50));

  // 1. Lister tous les utilisateurs avec rôle ADMIN ou MANAGER
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "MANAGER"] } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      blocked: true,
      phone: true,
      createdAt: true,
    },
  });

  if (admins.length === 0) {
    console.log("\n❌ Aucun compte ADMIN ou MANAGER trouvé dans la base.");
    console.log("   Voulez-vous créer un compte admin ? (o/n)");

    const answer = await ask("   > ");
    if (answer.toLowerCase() === "o" || answer.toLowerCase() === "oui") {
      const name = await ask("   Nom : ");
      const email = await ask("   Email : ");
      const password = await ask("   Mot de passe (min 6 car.) : ");

      if (!name || !email || password.length < 6) {
        console.log("   ❌ Données invalides. Abandon.");
        await prisma.$disconnect();
        return;
      }

      const hashed = hashPassword(password);
      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashed,
          role: "ADMIN",
          blocked: false,
        },
      });
      console.log(`\n   ✅ Compte admin créé : ${user.email} (id: ${user.id})`);
    }
    await prisma.$disconnect();
    return;
  }

  // 2. Afficher les comptes admin
  console.log(`\n📋 ${admins.length} compte(s) admin trouvé(s) :\n`);
  for (const a of admins) {
    const status = a.blocked ? "🔴 BLOQUÉ" : "🟢 Actif";
    console.log(`   ${status} | ${a.role} | ${a.email} | ${a.name} | id: ${a.id}`);
  }

  // 3. Pour chaque compte bloqué, proposer de débloquer
  const blocked = admins.filter((a) => a.blocked);
  if (blocked.length > 0) {
    console.log(`\n⚠️  ${blocked.length} compte(s) BLOQUÉ(S) détecté(s) !`);
    console.log("   Un compte bloqué ne peut pas se connecter.\n");

    for (const b of blocked) {
      const answer = await ask(`   Débloquer ${b.email} ? (o/n) : `);
      if (answer.toLowerCase() === "o" || answer.toLowerCase() === "oui") {
        await prisma.user.update({
          where: { id: b.id },
          data: { blocked: false },
        });
        console.log(`   ✅ ${b.email} débloqué.`);
      }
    }
  }

  // 4. Proposer de réinitialiser le mot de passe
  console.log("\n🔑 Réinitialisation du mot de passe :");
  const email = await ask("   Email du compte à réinitialiser (ou Entrée pour passer) : ");

  if (email) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.log(`   ❌ Aucun compte trouvé avec l'email : ${email}`);
    } else {
      const newPassword = await ask("   Nouveau mot de passe (min 6 car.) : ");
      if (newPassword.length < 6) {
        console.log("   ❌ Mot de passe trop court (6 car. minimum). Abandon.");
      } else {
        const hashed = hashPassword(newPassword);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashed,
            blocked: false,
            resetToken: null,
            resetTokenExpiry: null,
          },
        });
        console.log(`   ✅ Mot de passe réinitialisé pour ${user.email}`);
        console.log(`   ✅ Compte débloqué (si bloqué)`);
        console.log(`   ✅ Token de reset effacé (si existant)`);
      }
    }
  }

  // 5. Vérification finale
  console.log("\n" + "=".repeat(50));
  const finalAdmins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "MANAGER"] } },
    select: { email: true, role: true, blocked: true },
  });
  console.log("\n📊 État final des comptes admin :\n");
  for (const a of finalAdmins) {
    const status = a.blocked ? "🔴 BLOQUÉ" : "🟢 Actif";
    console.log(`   ${status} | ${a.role} | ${a.email}`);
  }
  console.log("\n✨ Terminé. Vous pouvez maintenant vous connecter avec le nouveau mot de passe.\n");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Erreur :", err);
  prisma.$disconnect();
  process.exit(1);
});
