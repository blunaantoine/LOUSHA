import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const badge = searchParams.get("badge");

    const where: Record<string, unknown> = {};
    if (category && category !== "all") where.categorySlug = category;
    if (featured === "true") where.featured = true;
    if (badge && badge !== "all") where.badge = badge;

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Impossible de charger les produits." },
      { status: 500 }
    );
  }
}
