import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { listAllCategoriesAdmin, createCategory } from "@/lib/services/admin-service";

export async function GET() {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  const categories = await listAllCategoriesAdmin();
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  try {
    const body = await req.json();
    if (!body.slug || !body.name || !body.image) {
      return NextResponse.json(
        { error: "Champs requis : slug, name, image." },
        { status: 400 }
      );
    }
    const cat = await createCategory({
      slug: body.slug,
      name: body.name,
      nameEn: body.nameEn || body.name,
      tagline: body.tagline || "",
      taglineEn: body.taglineEn || "",
      description: body.description || "",
      descriptionEn: body.descriptionEn || "",
      image: body.image,
      order: body.order ?? 0,
    });
    return NextResponse.json({ category: cat });
  } catch (error) {
    console.error("POST /api/admin/categories error:", error);
    return NextResponse.json({ error: "Création impossible." }, { status: 500 });
  }
}
