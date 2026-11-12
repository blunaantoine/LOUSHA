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
