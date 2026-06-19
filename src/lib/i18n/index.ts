/**
 * Couche d'internationalisation Lousha.
 *
 * Architecture modulaire :
 * - `fr.ts` / `en.ts` : dictionnaires (source de vérité des traductions)
 * - `types.ts`        : type Dict + vérification de cohérence FR/EN
 * - `index.ts`        : export public (dict, useDict, formatPrice)
 *
 * Les composants importent depuis "@/lib/i18n" (ce fichier).
 */
import type { Lang, Currency } from "@/lib/store";
import { RATES } from "@/lib/store";
import { fr } from "./fr";
import { en } from "./en";
import type { Dict } from "./types";

export const dict = { fr, en } as const;

export type { Dict } from "./types";

export function useDict(lang: Lang): Dict {
  return dict[lang] as Dict;
}

/**
 * Formate un prix. `cents` est stocké en centimes de XOF (Franc CFA).
 * La devise cible détermine la conversion et le symbole.
 */
export function formatPrice(
  cents: number,
  lang: Lang,
  currency: Currency = "XOF"
): string {
  const xofValue = cents / 100; // valeur en XOF
  const converted = xofValue * RATES[currency];

  let locale = lang === "fr" ? "fr-FR" : "en-US";
  let symbol: string;
  let minDigits: number;
  let maxDigits: number;

  if (currency === "XOF") {
    // XOF : pas de décimales (le FCFA s'arrondit à l'entier)
    locale = "fr-FR";
    symbol = "XOF";
    minDigits = 0;
    maxDigits = 0;
  } else if (currency === "EUR") {
    symbol = "€";
    minDigits = 2;
    maxDigits = 2;
  } else {
    symbol = "$";
    minDigits = 2;
    maxDigits = 2;
  }

  const formatted = converted.toLocaleString(locale, {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  });

  // Pour EUR/USD, symbole avant ; pour XOF, symbole après.
  if (currency === "XOF") return `${formatted} ${symbol}`;
  return `${symbol}${formatted}`;
}
