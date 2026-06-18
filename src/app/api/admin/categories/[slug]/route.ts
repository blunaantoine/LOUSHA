import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { updateCategory, deleteCategory } from "@/lib/services/admin-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  try {
    const { slug } = await params;
    const body = await req.json();
    const cat = await updateCategory(slug, body);
    return NextResponse.json({ category: cat });
  } catch (error) {
    console.error("PATCH /api/admin/categories/[slug] error:", error);
    return NextResponse.json({ error: "Modification impossible." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  try {
    const { slug } = await params;
    await deleteCategory(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/categories/[slug] error:", error);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
