import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { listContactMessages } from "@/lib/services/message-service";

export async function GET() {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  const messages = await listContactMessages();
  return NextResponse.json({ messages });
}
