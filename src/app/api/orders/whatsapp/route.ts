import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildOrderLines, createOrder } from "@/lib/services/order-service";
import { computeCartTotals } from "@/lib/services/cart-service";
import { clientIp, TOO_MANY, isValidEmail, isText } from "@/lib/security";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/orders/whatsapp
 * Crée une commande WhatsApp en DB (statut PENDING) avant d'ouvrir WhatsApp.
 * Si l'utilisateur est connecté, la commande est liée à son compte.
 *
 * Body: {
 *   items: [{ slug, name, priceCents, qty }],
 *   fullName, email, phone (optionnel si connecté),
 *   source: "product_page" | "checkout"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await rateLimit(`order:${clientIp(req.headers)}`, 20, 60 * 60 * 1000))) {
      return NextResponse.json({ error: TOO_MANY }, { status: 429 });
    }

    const body = await req.json();
    const { items, fullName, email, phone } = body;

    if (!items || !Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    // Récupère l'utilisateur connecté (optionnel)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;
    // Un visiteur non connecté peut commander par WhatsApp sans donner d'email :
    // la commande est enregistrée, le contact se fait ensuite dans WhatsApp.
    const userEmail: string = session?.user?.email ?? (typeof email === "string" ? email.trim() : "");
    const userName: string =
      session?.user?.name ?? (isText(fullName, 150) ? fullName.trim() : "Client WhatsApp");

    if ((userEmail !== "" && !isValidEmail(userEmail)) || !isText(userName, 150)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    if (phone !== undefined && phone !== null && phone !== "" && !isText(phone, 30)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    // Noms et prix pris en base (voir buildOrderLines)
    const built = await buildOrderLines(items);
    if (!built.ok) {
      return NextResponse.json({ error: built.error }, { status: 400 });
    }
    const lines = built.lines;

    // Calcule les totaux
    const totals = computeCartTotals(
      lines.map((l) => ({ ...l, nameEn: l.name, image: "" }))
    );

    // Crée la commande
    const order = await createOrder({
      userId,
      email: userEmail,
      fullName: userName,
      phone: phone || null,
      address: "Commande WhatsApp",
      city: "—",
      zip: "—",
      country: "—",
      lines,
      shippingCents: 0,
      totalCents: totals.total,
      paymentProvider: "WHATSAPP",
      // Pas de paymentTransactionId → statut PENDING (en attente)
    });

    return NextResponse.json({ orderId: order.id, ok: true });
  } catch (error) {
    console.error("POST /api/orders/whatsapp error:", error);
    return NextResponse.json({ error: "Échec de création" }, { status: 500 });
  }
}
