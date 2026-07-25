import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const slides = await db.promoSlide.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ slides });
  } catch (error) {
    console.error("GET /api/promo error:", error);
    return NextResponse.json({ slides: [] });
  }
}
