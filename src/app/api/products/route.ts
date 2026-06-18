import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/lib/services/product-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? undefined;
    const featured = searchParams.get("featured") === "true";
    const badge = searchParams.get("badge") ?? undefined;

    const products = await listProducts({ category, featured, badge });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Impossible de charger les produits." },
      { status: 500 }
    );
  }
}
