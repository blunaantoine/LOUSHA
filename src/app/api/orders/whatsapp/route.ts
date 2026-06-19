import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createOrder } from "@/lib/services/order-service";
import { computeCartTotals } from "@/lib/services/cart-service";

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
    const body = await req.json();
    const { items, fullName, email, phone, source } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    // Récupère l'utilisateur connecté (optionnel)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;
    const userEmail = session?.user?.email ?? email;
    const userName = session?.user?.name ?? fullName;

    if (!userEmail || !userName) {
      return NextResponse.json(
        { error: "Nom et email requis" },
        { status: 400 }
      );
    }

    // Calcule les totaux
    const totals = computeCartTotals(
      items.map((i: { slug: string; name: string; priceCents: number; qty: number }) => ({
        slug: i.slug,
        name: i.name,
        nameEn: i.name,
        priceCents: i.priceCents,
        image: "",
        qty: i.qty,
      }))
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
      lines: items.map((i: { slug: string; name: string; priceCents: number; qty: number }) => ({
        slug: i.slug,
        name: i.name,
        priceCents: i.priceCents,
        qty: i.qty,
      })),
      shippingCents: 0,
      totalCents: totals.total,
      paymentProvider: "WHATSAPP",
      paymentTransactionId: `wa_${Date.now()}`,
    });

    return NextResponse.json({ orderId: order.id, ok: true });
  } catch (error) {
    console.error("POST /api/orders/whatsapp error:", error);
    return NextResponse.json({ error: "Échec de création" }, { status: 500 });
  }
}
