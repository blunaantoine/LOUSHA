import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { listAllNotifications, createNotification } from "@/lib/services/notification-service";

export async function GET() {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  const notifications = await listAllNotifications();
  return NextResponse.json({ notifications });
}

export async function POST(req: NextRequest) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  const body = await req.json();
  if (!body.title || !body.message) {
    return NextResponse.json({ error: "Titre et message requis" }, { status: 400 });
  }
  const notif = await createNotification(body);
  return NextResponse.json({ notification: notif });
}
