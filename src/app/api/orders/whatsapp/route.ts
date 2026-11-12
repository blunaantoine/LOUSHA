import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createOrder } from "@/lib/services/order-service";
import { computeCartTotals } from "@/lib/services/cart-service";
import { db } from "@/lib/db";
import { rateLimit, clientIp, TOO_MANY, isValidEmail, isText } from "@/lib/security";

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
type RawItem = { slug?: unknown; priceCents?: unknown; qty?: unknown };

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`order:${clientIp(req.headers)}`, 20, 60 * 60 * 1000)) {
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
    const userEmail = session?.user?.email ?? email;
    const userName = session?.user?.name ?? fullName;

    if (!userEmail || !userName) {
      return NextResponse.json(
        { error: "Nom et email requis" },
        { status: 400 }
      );
    }
    if (!isValidEmail(userEmail) || !isText(userName, 150)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    if (phone !== undefined && phone !== null && phone !== "" && !isText(phone, 30)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    // Les noms et les prix viennent de la base de données, jamais du navigateur.
    // Le prix envoyé sert uniquement à identifier la variante choisie : il doit
    // correspondre au prix du produit ou à celui d'une de ses variantes actives.
    const slugs = [...new Set((items as RawItem[]).map((i) => i?.slug).filter((s): s is string => typeof s === "string"))];
    const products = await db.product.findMany({
      where: { slug: { in: slugs } },
      select: {
        slug: true,
        name: true,
        priceCents: true,
        variants: { where: { active: true }, select: { priceCents: true } },
      },
    });
    const bySlug = new Map(products.map((p) => [p.slug, p]));

    const lines: { slug: string; name: string; priceCents: number; qty: number }[] = [];
    for (const raw of items as RawItem[]) {
      const product = typeof raw?.slug === "string" ? bySlug.get(raw.slug) : undefined;
      const qty = Number(raw?.qty);
      if (!product || !Number.isInteger(qty) || qty < 1 || qty > 100) {
        return NextResponse.json({ error: "Article invalide" }, { status: 400 });
      }
      const allowedPrices = [product.priceCents, ...product.variants.map((v) => v.priceCents)];
      const priceCents = allowedPrices.includes(Number(raw.priceCents))
        ? Number(raw.priceCents)
        : null;
      if (priceCents === null) {
        return NextResponse.json({ error: "Prix invalide" }, { status: 400 });
      }
      lines.push({ slug: product.slug, name: product.name, priceCents, qty });
    }

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
