import { NextResponse } from "next/server";
import { getAllSiteContent, getAllSiteImages } from "@/lib/services/content-service";

/**
 * GET /api/site-content — tous les textes + images éditables (public).
 * Retourné en une seule requête pour éviter le waterfall sur la home.
 */
export async function GET() {
  try {
    const [content, images] = await Promise.all([
      getAllSiteContent(),
      getAllSiteImages(),
    ]);
    return NextResponse.json({ content, images });
  } catch (error) {
    console.error("GET /api/site-content error:", error);
    return NextResponse.json({ content: {}, images: {} }, { status: 200 });
  }
}
