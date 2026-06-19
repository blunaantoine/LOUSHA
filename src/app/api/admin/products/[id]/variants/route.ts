import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/guards";
import { listVariants, createVariant } from "@/lib/services/admin-service";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  const { id } = await params;
  const variants = await listVariants(id);
  return NextResponse.json({ variants });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    if (!body.label || !body.value || body.priceCents === undefined) {
      return NextResponse.json(
        { error: "Champs requis : label, value, priceCents" },
        { status: 400 }
      );
    }
    const variant = await createVariant(id, body);
    return NextResponse.json({ variant });
  } catch (error) {
    console.error("POST variant error:", error);
    return NextResponse.json({ error: "Création impossible" }, { status: 500 });
  }
}
