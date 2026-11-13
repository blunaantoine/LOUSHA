import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, isText, isValidEmail, TOO_MANY } from "@/lib/security";
import { buildOrderLines, createOrder } from "@/lib/services/order-service";
import { computeCartTotals } from "@/lib/services/cart-service";
import { isPaymentEnabled } from "@/lib/services/settings-service";
import {
  centsToXof,
  createCheckoutInvoice,
  isPaydunyaConfigured,
} from "@/lib/services/paydunya-service";

/**
 * POST /api/payments/paydunya/checkout
 * Body : { items: [{ slug, priceCents, qty }], fullName, email, phone, address, city }
 *
 * Enregistre la commande (statut PENDING) puis crée la facture PayDunya.
 * Renvoie { url } : la page de paiement PayDunya vers laquelle rediriger.
 */
export async function POST(req: NextRequest) {
  try {
    if (!(await rateLimit(`paydunya:${clientIp(req.headers)}`, 15, 60 * 60 * 1000))) {
      return NextResponse.json({ error: TOO_MANY }, { status: 429 });
    }
    if (!isPaydunyaConfigured() || !(await isPaymentEnabled())) {
      return NextResponse.json(
        { error: "Le paiement en ligne est indisponible pour le moment." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { items, fullName, email, phone, address, city } = body ?? {};

    if (
      !isText(fullName, 150) ||
      !isValidEmail(email) ||
      !isText(phone, 30) ||
      !isText(address, 250) ||
      !isText(city, 100)
    ) {
      return NextResponse.json(
        { error: "Merci de remplir tous les champs (nom, e-mail, téléphone, adresse, ville)." },
        { status: 400 }
      );
    }

    const built = await buildOrderLines(items);
    if (!built.ok) return NextResponse.json({ error: built.error }, { status: 400 });

    const totals = computeCartTotals(
      built.lines.map((l) => ({ ...l, nameEn: l.name, image: "" }))
    );
    const totalXof = centsToXof(totals.total);
    if (totalXof < 200) {
      return NextResponse.json({ error: "Montant trop faible." }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const order = await createOrder({
      userId: session?.user?.id ?? null,
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      zip: "—",
      country: "Togo",
      lines: built.lines,
      shippingCents: 0,
      totalCents: totals.total,
    });

    const site = (process.env.NEXTAUTH_URL || req.nextUrl.origin).replace(/\/$/, "");
    const resultUrl = `${site}/checkout/result?order=${order.id}`;

    try {
      const invoice = await createCheckoutInvoice({
        orderId: order.id,
        totalXof,
        description: `Commande Lousha Accessoires n° ${order.id}`,
        items: built.lines.map((l) => ({
          name: l.name,
          quantity: l.qty,
          unitPriceXof: centsToXof(l.priceCents),
        })),
        returnUrl: resultUrl,
        cancelUrl: `${resultUrl}&cancelled=1`,
        callbackUrl: `${site}/api/payments/paydunya/ipn`,
        storeUrl: site,
      });
      await db.payment.create({
        data: {
          orderId: order.id,
          provider: "PAYDUNYA",
          transactionId: invoice.token,
          status: "PENDING",
        },
      });
      return NextResponse.json({ url: invoice.url, orderId: order.id });
    } catch (error) {
      console.error("[paydunya] création de facture impossible :", error);
      await db.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      return NextResponse.json(
        { error: "Le paiement n'a pas pu être lancé. Réessayez ou commandez par WhatsApp." },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("POST /api/payments/paydunya/checkout error:", error);
    return NextResponse.json({ error: "Échec" }, { status: 500 });
  }
}
