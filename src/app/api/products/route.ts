import { NextRequest, NextResponse } from "next/server";
import { listProducts } from "@/lib/services/product-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? undefined;
    const featured = searchParams.get("featured") === "true";
    const badge = searchParams.get("badge") ?? undefined;
    const search = searchParams.get("search") ?? undefined;

    let products = await listProducts({ category, featured, badge });

    // Filtre de recherche (sur nom FR + EN)
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nameEn.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.descriptionEn.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { error: "Impossible de charger les produits." },
      { status: 500 }
    );
  }
}
