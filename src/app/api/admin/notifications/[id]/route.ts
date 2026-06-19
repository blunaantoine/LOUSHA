import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { toggleNotification, deleteNotification } from "@/lib/services/notification-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  if (body.active !== undefined) {
    const n = await toggleNotification(id, Boolean(body.active));
    return NextResponse.json({ notification: n });
  }
  return NextResponse.json({ error: "Rien à modifier" }, { status: 400 });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  const { id } = await params;
  await deleteNotification(id);
  return NextResponse.json({ ok: true });
}
