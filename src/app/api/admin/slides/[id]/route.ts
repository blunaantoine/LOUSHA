import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { updateHeroSlide, deleteHeroSlide } from "@/lib/services/admin-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireStaff())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json();
    const slide = await updateHeroSlide(id, body);
    return NextResponse.json({ slide });
  } catch (error) {
    console.error("PATCH /api/admin/slides/[id] error:", error);
    return NextResponse.json({ error: "Modification impossible." }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await requireStaff())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const { id } = await params;
    await deleteHeroSlide(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/slides/[id] error:", error);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
