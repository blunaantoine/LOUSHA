import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { listAllProductsAdmin, createProduct } from "@/lib/services/admin-service";

export async function GET() {
  try {
    if (!(await requireStaff())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const products = await listAllProductsAdmin();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await requireStaff())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const body = await req.json();
    if (!body.slug || !body.name || !body.priceCents || !body.categorySlug || !body.image) {
      return NextResponse.json(
        { error: "Champs requis manquants (slug, name, priceCents, categorySlug, image)." },
        { status: 400 }
      );
    }
    const product = await createProduct(body);
    return NextResponse.json({ product });
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json({ error: "Création impossible." }, { status: 500 });
  }
}
