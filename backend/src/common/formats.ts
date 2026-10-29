/** Code volontaire : 6 chiffres, un tiret, 2 chiffres (ex. 012346-00). */
export const VOLUNTEER_CODE_REGEX = /^\d{6}-\d{2}$/;

/** Prénom / nom : lettres (accents compris), espaces, tirets et apostrophes. */
export const PERSON_NAME_REGEX = /^\p{L}(?:[\p{L}' -]*\p{L})?$/u;
export const PERSON_NAME_MIN_LENGTH = 2;
export const PERSON_NAME_MAX_LENGTH = 50;

/** Mobile sénégalais normalisé en E.164 (préfixes 70, 75, 76, 77, 78). */
export const SENEGAL_MOBILE_E164_REGEX = /^\+2217[05678]\d{7}$/;

/**
 * Normalise une saisie de numéro sénégalais en E.164.
 * Accepte espaces, points, tirets et les préfixes +221 / 00221.
 * Retourne la saisie nettoyée telle quelle si elle n'est pas un mobile valide.
 */
export function normalizeSenegalPhone(input: string): string {
  const cleaned = input.replace(/[\s.-]/g, '');
  const local = cleaned.replace(/^(?:\+221|00221)/, '');
  return /^7[05678]\d{7}$/.test(local) ? `+221${local}` : cleaned;
}

/** Normalise un prénom / nom : trim et espaces multiples réduits. */
export function normalizePersonName(input: string): string {
  return input.trim().replace(/\s+/g, ' ').replace(/’/g, "'");
}
