import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { db } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireStaff())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json();
    const slide = await db.promoSlide.update({ where: { id }, data: body });
    return NextResponse.json({ slide });
  } catch (error) {
    console.error("PATCH /api/admin/promo/[id] error:", error);
    return NextResponse.json({ error: "Modification échouée" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await requireStaff())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const { id } = await params;
    await db.promoSlide.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/promo/[id] error:", error);
    return NextResponse.json({ error: "Suppression échouée" }, { status: 500 });
  }
}
