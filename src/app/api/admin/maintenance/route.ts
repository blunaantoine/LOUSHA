import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdmin } from "@/lib/guards";
import { rateLimit } from "@/lib/rate-limit";
import { TOO_MANY } from "@/lib/security";
import { hashPassword, verifyPassword } from "@/lib/services/auth-service";
import {
  getMaintenancePinHash,
  isMaintenanceEnabled,
  setMaintenanceEnabled,
  setMaintenancePinHash,
} from "@/lib/services/settings-service";

export const dynamic = "force-dynamic";

const PIN_RE = /^\d{4}$/;

/**
 * GET /api/admin/maintenance — état du mode maintenance (ADMIN uniquement).
 */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  const [enabled, pinHash] = await Promise.all([
    isMaintenanceEnabled(),
    getMaintenancePinHash(),
  ]);
  return NextResponse.json(
    { enabled, pinConfigured: !!pinHash },
    { headers: { "Cache-Control": "no-store" } }
  );
}

/**
 * POST /api/admin/maintenance — active ou désactive la maintenance (ADMIN).
 *
 * Body :
 * - { enabled: boolean, pin: "1234" }            si un code existe déjà
 * - { enabled: boolean, newPin: "1234", confirmPin: "1234" }  à la première utilisation
 *
 * Le code est exigé pour activer comme pour désactiver. Il est stocké haché
 * (scrypt), jamais en clair. 5 essais par tranche de 15 minutes et par admin.
 */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? "unknown";

  try {
    const body = await req.json();
    const { enabled, pin, newPin, confirmPin } = body as {
      enabled?: unknown;
      pin?: unknown;
      newPin?: unknown;
      confirmPin?: unknown;
    };
    if (typeof enabled !== "boolean") {
      return NextResponse.json({ error: "Valeur invalide" }, { status: 400 });
    }

    const pinHash = await getMaintenancePinHash();

    if (!pinHash) {
      // Première utilisation : création du code.
      if (typeof newPin !== "string" || !PIN_RE.test(newPin)) {
        return NextResponse.json(
          { error: "Le code doit contenir exactement 4 chiffres.", code: "PIN_FORMAT" },
          { status: 400 }
        );
      }
      if (newPin !== confirmPin) {
        return NextResponse.json(
          { error: "Les deux codes ne correspondent pas.", code: "PIN_MISMATCH" },
          { status: 400 }
        );
      }
      await setMaintenancePinHash(await hashPassword(newPin));
    } else {
      if (!(await rateLimit(`maintenance-pin:${userId}`, 5, 15 * 60 * 1000))) {
        return NextResponse.json({ error: TOO_MANY, code: "TOO_MANY" }, { status: 429 });
      }
      const ok =
        typeof pin === "string" && PIN_RE.test(pin) && (await verifyPassword(pin, pinHash));
      if (!ok) {
        return NextResponse.json(
          { error: "Code incorrect.", code: "PIN_WRONG" },
          { status: 403 }
        );
      }
    }

    await setMaintenanceEnabled(enabled);
    console.warn(
      `[maintenance] ${enabled ? "ACTIVÉE" : "désactivée"} par l'utilisateur ${userId}`
    );
    return NextResponse.json({ enabled, pinConfigured: true });
  } catch (error) {
    console.error("POST /api/admin/maintenance error:", error);
    return NextResponse.json({ error: "Échec" }, { status: 500 });
  }
}
