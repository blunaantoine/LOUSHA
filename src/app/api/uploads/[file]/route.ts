import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * GET /api/uploads/[file] — sert une image uploadée.
 *
 * Cette route contourne les problèmes de static serving en production standalone.
 * L'image est lue depuis UPLOAD_DIR (ou public/uploads par défaut) et renvoyée
 * avec le bon content-type.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  try {
    const { file } = await params;

    // Sécurité : empêche les path traversal
    if (file.includes("..") || file.includes("/") || file.includes("\\")) {
      return new NextResponse("Not found", { status: 404 });
    }

    const baseDir =
      process.env.UPLOAD_DIR ||
      path.join(process.cwd(), "public", "uploads");

    // Cherche le fichier dans UPLOAD_DIR
    let filepath = path.join(baseDir, file);
    if (!fs.existsSync(filepath)) {
      // Fallback : cherche dans public/uploads du projet
      filepath = path.join(process.cwd(), "public", "uploads", file);
    }
    if (!fs.existsSync(filepath)) {
      // Fallback : cherche dans .next/standalone/public/uploads
      filepath = path.join(process.cwd(), ".next", "standalone", "public", "uploads", file);
    }
    if (!fs.existsSync(filepath)) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Détermine le content-type
    const ext = file.split(".").pop()?.toLowerCase() || "";
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";

    const buffer = fs.readFileSync(filepath);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("GET /api/uploads/[file] error:", error);
    return new NextResponse("Not found", { status: 404 });
  }
}
