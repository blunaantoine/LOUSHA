import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { markMessageRead, deleteMessage, getMessage } from "@/lib/services/message-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  if (body.read !== undefined) {
    const msg = await markMessageRead(id, Boolean(body.read));
    return NextResponse.json({ message: msg });
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
  await deleteMessage(id);
  return NextResponse.json({ ok: true });
}
