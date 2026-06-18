import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { listHeroSlides, createHeroSlide } from "@/lib/services/admin-service";

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const slides = await listHeroSlides(false);
    return NextResponse.json({ slides });
  } catch (error) {
    console.error("GET /api/admin/slides error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const body = await req.json();
    if (!body.image || !body.titleFr || !body.titleEn) {
      return NextResponse.json(
        { error: "Champs requis manquants (image, titleFr, titleEn)." },
        { status: 400 }
      );
    }
    const slide = await createHeroSlide(body);
    return NextResponse.json({ slide });
  } catch (error) {
    console.error("POST /api/admin/slides error:", error);
    return NextResponse.json({ error: "Création impossible." }, { status: 500 });
  }
}
