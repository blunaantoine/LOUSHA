/**
 * Service Contenu du site — textes et images éditables de la page d'accueil.
 *
 * Permet à l'admin de modifier les textes (FR/EN) et images des sections
 * story, material, contact, promo sans toucher au code.
 */
import { db } from "@/lib/db";

export interface SiteContentEntry {
  key: string;
  valueFr: string;
  valueEn: string;
}

export interface SiteImageEntry {
  key: string;
  url: string;
}

/** Récupère tous les textes éditables (public). */
export async function getAllSiteContent(): Promise<Record<string, SiteContentEntry>> {
  const rows = await db.siteContent.findMany();
  const map: Record<string, SiteContentEntry> = {};
  for (const r of rows) {
    map[r.key] = { key: r.key, valueFr: r.valueFr, valueEn: r.valueEn };
  }
  return map;
}

/** Récupère toutes les images éditables (public). */
export async function getAllSiteImages(): Promise<Record<string, string>> {
  const rows = await db.siteImage.findMany();
  const map: Record<string, string> = {};
  for (const r of rows) {
    map[r.key] = r.url;
  }
  return map;
}

/** Met à jour ou crée un texte (admin). */
export async function upsertSiteContent(key: string, valueFr: string, valueEn: string) {
  return db.siteContent.upsert({
    where: { key },
    update: { valueFr, valueEn },
    create: { key, valueFr, valueEn },
  });
}

/** Met à jour ou crée une image (admin). */
export async function upsertSiteImage(key: string, url: string) {
  return db.siteImage.upsert({
    where: { key },
    update: { url },
    create: { key, url },
  });
}

/** Met à jour plusieurs textes en une fois (admin). */
export async function bulkUpsertSiteContent(entries: SiteContentEntry[]) {
  await Promise.all(
    entries.map((e) => upsertSiteContent(e.key, e.valueFr, e.valueEn))
  );
}

/** Met à jour plusieurs images en une fois (admin). */
export async function bulkUpsertSiteImages(entries: SiteImageEntry[]) {
  await Promise.all(entries.map((e) => upsertSiteImage(e.key, e.url)));
}

/** Supprime une image éditable (admin) — retourne l'URL supprimée pour permettre le nettoyage du fichier. */
export async function deleteSiteImage(key: string): Promise<string | null> {
  const existing = await db.siteImage.findUnique({ where: { key } });
  if (!existing) return null;
  await db.siteImage.delete({ where: { key } });
  return existing.url;
}
