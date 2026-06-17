import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await db.product.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit introuvable." },
        { status: 404 }
      );
    }

    // Cross-sell: autres produits de la même catégorie
    const related = await db.product.findMany({
      where: {
        categorySlug: product.categorySlug,
        NOT: { id: product.id },
      },
      take: 4,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ product, related });
  } catch (error) {
    console.error("GET /api/products/[slug] error:", error);
    return NextResponse.json(
      { error: "Impossible de charger ce produit." },
      { status: 500 }
    );
  }
}
