import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { db } from "@/lib/db";
import { getProjectRoot, getUploadDir } from "@/lib/uploads";

export const dynamic = "force-dynamic";

/**
 * GET /og-image.jpg — image d'aperçu affichée quand on partage un lien du
 * site (WhatsApp, Facebook, Messenger, X…).
 *
 * L'image se change depuis l'administration, onglet Médias (« Aperçu des
 * liens »). Elle est recadrée au format 1200 × 630 recommandé par les réseaux
 * sociaux. Sans image choisie : /images/og-default.jpg.
 */
const WIDTH = 1200;
const HEIGHT = 630;
const DEFAULT_IMAGE = "/images/og-default.jpg";

let cache: { key: string; body: Buffer } | null = null;

/** Chemin du fichier sur le disque à partir de l'URL enregistrée. */
function resolveFile(url: string | undefined | null): string | null {
  if (!url || url.includes("..")) return null;
  const root = getProjectRoot();
  const upload = url.match(/^\/(?:api\/)?uploads\/([A-Za-z0-9._-]+)$/);
  if (upload) {
    const candidates = [
      path.join(getUploadDir(), upload[1]),
      path.join(root, "public", "uploads", upload[1]),
    ];
    return candidates.find((p) => fs.existsSync(p)) ?? null;
  }
  if (/^\/images\/[A-Za-z0-9._/-]+$/.test(url)) {
    const p = path.join(root, "public", url);
    return fs.existsSync(p) ? p : null;
  }
  return null;
}

export async function GET() {
  try {
    const row = await db.siteImage.findUnique({ where: { key: "og-image" } });
    const file = resolveFile(row?.url) ?? resolveFile(DEFAULT_IMAGE);
    if (!file) return new NextResponse("Not found", { status: 404 });

    const key = `${file}:${fs.statSync(file).mtimeMs}`;
    if (cache?.key !== key) {
      const body = await sharp(file)
        .rotate() // respecte l'orientation des photos de téléphone
        .resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
      cache = { key, body };
    }

    return new NextResponse(new Uint8Array(cache.body), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("GET /og-image.jpg error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}
