import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/services/auth-service";
import { rateLimit, clientIp, TOO_MANY, isValidEmail, isText } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`register:${clientIp(req.headers)}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: TOO_MANY }, { status: 429 });
    }
    const body = await req.json();
    const { name, email, password, phone } = body as {
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nom, email et mot de passe requis." },
        { status: 400 }
      );
    }
    if (
      !isText(name, 100) ||
      !isValidEmail(email) ||
      typeof password !== "string" ||
      password.length > 200 ||
      (phone !== undefined && phone !== null && phone !== "" && !isText(phone, 30))
    ) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Le mot de passe doit faire au moins 6 caractères." },
        { status: 400 }
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }

    const user = await createUser({ name, email, password, phone: phone || undefined });
    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { error: "Impossible de créer le compte." },
      { status: 500 }
    );
  }
}
