import { NextResponse } from "next/server";
import { listHeroSlides } from "@/lib/services/admin-service";

/**
 * GET /api/hero — slides actifs du carrousel (public).
 * Retourne les slides triés par ordre, actifs uniquement.
 */
export async function GET() {
  try {
    const slides = await listHeroSlides(true);
    return NextResponse.json({ slides });
  } catch (error) {
    console.error("GET /api/hero error:", error);
    return NextResponse.json({ slides: [] }, { status: 200 });
  }
}
