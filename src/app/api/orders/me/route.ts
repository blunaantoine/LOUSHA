import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listOrdersByEmail } from "@/lib/services/order-service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const orders = await listOrdersByEmail(session.user.email);
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("GET /api/orders/me error:", error);
    return NextResponse.json(
      { error: "Impossible de charger les commandes." },
      { status: 500 }
    );
  }
}
