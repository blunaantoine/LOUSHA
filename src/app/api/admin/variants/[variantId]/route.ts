import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { updateVariant, deleteVariant } from "@/lib/services/admin-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  const { variantId } = await params;
  const body = await req.json();
  const variant = await updateVariant(variantId, body);
  return NextResponse.json({ variant });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ variantId: string }> }
) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  const { variantId } = await params;
  await deleteVariant(variantId);
  return NextResponse.json({ ok: true });
}
