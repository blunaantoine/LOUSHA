/**
 * Script to create or reset the admin user.
 * Usage: bun run scripts/create-admin.ts
 *
 * If the admin user already exists, it resets the password.
 * If not, it creates a new admin user.
 */
import { db } from "../src/lib/db";
import { hashPassword } from "../src/lib/services/auth-service";

const ADMIN_EMAIL = "admin@lousha-accessories.com";
const ADMIN_PASSWORD = "lousha-admin";
const ADMIN_NAME = "Admin Lousha";

async function main() {
  console.log("🔧 Creating/resetting admin user...");

  const existing = await db.user.findUnique({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    const hashed = await hashPassword(ADMIN_PASSWORD);
    await db.user.update({
      where: { id: existing.id },
      data: {
        password: hashed,
        role: "ADMIN",
        blocked: false,
        name: ADMIN_NAME,
      },
    });
    console.log(`✅ Admin user reset: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    const hashed = await hashPassword(ADMIN_PASSWORD);
    await db.user.create({
      data: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hashed,
        role: "ADMIN",
      },
    });
    console.log(`✅ Admin user created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
