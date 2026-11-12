import type { fr } from "./fr";
import type { en } from "./en";

/**
 * Type du dictionnaire de traductions.
 * Dérivé du dictionnaire français (source de vérité).
 */
export type Dict = typeof fr;

/**
 * Vérifie à la compilation que les deux dictionnaires ont la même forme.
 * Si une clé manque dans `en`, TypeScript lèvera une erreur ici.
 */
type Shape<T> = T extends string
  ? string
  : T extends readonly unknown[]
    ? { readonly [K in keyof T]: Shape<T[K]> }
    : { readonly [K in keyof T]: Shape<T[K]> };
type AssertShape<T extends Shape<Dict>> = T;
type _CheckFr = AssertShape<typeof fr>;
type _CheckEn = AssertShape<typeof en>;
