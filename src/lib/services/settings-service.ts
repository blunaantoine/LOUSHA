/**
 * Service Réglages — réglages globaux du site, stockés en base (SiteSetting).
 * Ils s'appliquent à tous les visiteurs, pas seulement au navigateur de l'admin.
 */
import { db } from "@/lib/db";

const PAYMENT_KEY = "paymentEnabled";

/** Paiement en ligne activé ? Désactivé tant que l'admin ne l'a pas activé. */
export async function isPaymentEnabled(): Promise<boolean> {
  const row = await db.siteSetting.findUnique({ where: { key: PAYMENT_KEY } });
  return row?.value === "true";
}

export async function setPaymentEnabled(enabled: boolean): Promise<boolean> {
  const value = enabled ? "true" : "false";
  await db.siteSetting.upsert({
    where: { key: PAYMENT_KEY },
    create: { key: PAYMENT_KEY, value },
    update: { value },
  });
  return enabled;
}

/* ============ Mode maintenance ============ */

const MAINTENANCE_KEY = "maintenanceEnabled";
const MAINTENANCE_PIN_KEY = "maintenancePinHash";

/** Site fermé aux visiteurs ? */
export async function isMaintenanceEnabled(): Promise<boolean> {
  const row = await db.siteSetting.findUnique({ where: { key: MAINTENANCE_KEY } });
  return row?.value === "true";
}

export async function setMaintenanceEnabled(enabled: boolean): Promise<boolean> {
  const value = enabled ? "true" : "false";
  await db.siteSetting.upsert({
    where: { key: MAINTENANCE_KEY },
    create: { key: MAINTENANCE_KEY, value },
    update: { value },
  });
  return enabled;
}

/** Hash du code à 4 chiffres (null si aucun code n'a encore été créé). */
export async function getMaintenancePinHash(): Promise<string | null> {
  const row = await db.siteSetting.findUnique({ where: { key: MAINTENANCE_PIN_KEY } });
  return row?.value || null;
}

export async function setMaintenancePinHash(hash: string): Promise<void> {
  await db.siteSetting.upsert({
    where: { key: MAINTENANCE_PIN_KEY },
    create: { key: MAINTENANCE_PIN_KEY, value: hash },
    update: { value: hash },
  });
}
