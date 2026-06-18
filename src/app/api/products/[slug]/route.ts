import { NextRequest, NextResponse } from "next/server";
import { getProductWithRelated } from "@/lib/services/product-service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { product, related } = await getProductWithRelated(slug);

    if (!product) {
      return NextResponse.json(
        { error: "Produit introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({ product, related });
  } catch (error) {
    console.error("GET /api/products/[slug] error:", error);
    return NextResponse.json(
      { error: "Impossible de charger ce produit." },
      { status: 500 }
    );
  }
}
