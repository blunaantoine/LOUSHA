/**
 * Limitation de débit (fenêtre fixe), stockée en base de données.
 *
 * Les compteurs survivent aux redémarrages du serveur et sont partagés entre
 * tous les processus. Si la base est momentanément indisponible, un compteur
 * en mémoire prend le relais pour ne jamais laisser une route sans protection.
 */
import { db } from "./db";

type Bucket = { count: number; resetAt: number };
const g = globalThis as unknown as { _loushaRateBuckets?: Map<string, Bucket> };
const memory = (g._loushaRateBuckets ??= new Map<string, Bucket>());

function memoryLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (memory.size > 5000) {
    for (const [k, b] of memory) if (b.resetAt <= now) memory.delete(k);
  }
  const bucket = memory.get(key);
  if (!bucket || bucket.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

/**
 * Retourne true si la requête est autorisée, false si la limite est dépassée.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const k = key.slice(0, 300);
  const now = new Date();
  try {
    // Incrémente le compteur de la fenêtre en cours (opération atomique)
    const bumped = await db.rateLimit.updateMany({
      where: { key: k, resetAt: { gt: now } },
      data: { count: { increment: 1 } },
    });
    if (bumped.count > 0) {
      const row = await db.rateLimit.findUnique({ where: { key: k }, select: { count: true } });
      return (row?.count ?? 1) <= limit;
    }

    // Pas de fenêtre en cours : on en ouvre une nouvelle
    const resetAt = new Date(now.getTime() + windowMs);
    await db.rateLimit.upsert({
      where: { key: k },
      create: { key: k, count: 1, resetAt },
      update: { count: 1, resetAt },
    });

    // Nettoyage occasionnel des fenêtres expirées
    if (Math.random() < 0.02) {
      await db.rateLimit.deleteMany({ where: { resetAt: { lte: now } } });
    }
    return true;
  } catch (error) {
    console.error("[rate-limit] base indisponible, repli en mémoire :", error);
    return memoryLimit(k, limit, windowMs);
  }
}
