import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { deleteSubscriber } from "@/lib/services/message-service";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  const { id } = await params;
  await deleteSubscriber(id);
  return NextResponse.json({ ok: true });
}
