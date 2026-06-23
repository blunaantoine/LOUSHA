import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { db } from "@/lib/db";

export async function GET() {
  try {
    if (!(await requireStaff())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const slides = await db.promoSlide.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ slides });
  } catch (error) {
    console.error("GET /api/admin/promo error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await requireStaff())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const body = await req.json();
    if (!body.image) {
      return NextResponse.json({ error: "Image requise" }, { status: 400 });
    }
    const maxOrder = await db.promoSlide.aggregate({ _max: { order: true } });
    const slide = await db.promoSlide.create({
      data: {
        image: body.image,
        titleFr: body.titleFr || "",
        titleEn: body.titleEn || "",
        textFr: body.textFr || "",
        textEn: body.textEn || "",
        linkView: body.linkView || "shop",
        linkLabelFr: body.linkLabelFr || "",
        linkLabelEn: body.linkLabelEn || "",
        order: (maxOrder._max.order ?? -1) + 1,
        active: body.active ?? true,
      },
    });
    return NextResponse.json({ slide });
  } catch (error) {
    console.error("POST /api/admin/promo error:", error);
    return NextResponse.json({ error: "Création échouée" }, { status: 500 });
  }
}
