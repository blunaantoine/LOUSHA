import { NextResponse } from "next/server";
import { listCategories } from "@/lib/services/product-service";

export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "Impossible de charger les catégories." },
      { status: 500 }
    );
  }
}
