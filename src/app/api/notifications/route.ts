import { NextResponse } from "next/server";
import { listActiveNotifications } from "@/lib/services/notification-service";

/** GET /api/notifications — notifications actives (public) */
export async function GET() {
  try {
    const notifications = await listActiveNotifications();
    return NextResponse.json({ notifications });
  } catch {
    return NextResponse.json({ notifications: [] });
  }
}
