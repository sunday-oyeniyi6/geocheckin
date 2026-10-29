// Mêmes règles que backend/src/common/formats.ts — garder les deux fichiers synchronisés.

/** Code volontaire : 6 chiffres, un tiret, 2 chiffres (ex. 012346-00). */
export const VOLUNTEER_CODE_REGEX = /^\d{6}-\d{2}$/;

/** Prénom / nom : lettres (accents compris), espaces, tirets et apostrophes. */
export const PERSON_NAME_REGEX = /^\p{L}(?:[\p{L}' -]*\p{L})?$/u;
export const PERSON_NAME_MIN_LENGTH = 2;
export const PERSON_NAME_MAX_LENGTH = 50;

/** Mobile sénégalais normalisé en E.164 (préfixes 70, 75, 76, 77, 78). */
export const SENEGAL_MOBILE_E164_REGEX = /^\+2217[05678]\d{7}$/;

/** Formate la saisie du code : chiffres uniquement, tiret inséré après 6 chiffres. */
export function formatVolunteerCodeInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  return digits.length > 6 ? `${digits.slice(0, 6)}-${digits.slice(6)}` : digits;
}

export function normalizeSenegalPhone(input: string): string {
  const cleaned = input.replace(/[\s.-]/g, "");
  const local = cleaned.replace(/^(?:\+221|00221)/, "");
  return /^7[05678]\d{7}$/.test(local) ? `+221${local}` : cleaned;
}

export function normalizePersonName(input: string): string {
  return input.trim().replace(/\s+/g, " ").replace(/’/g, "'");
}

export function isValidPersonName(input: string): boolean {
  const name = normalizePersonName(input);
  return (
    name.length >= PERSON_NAME_MIN_LENGTH &&
    name.length <= PERSON_NAME_MAX_LENGTH &&
    PERSON_NAME_REGEX.test(name)
  );
}

export function isValidSenegalPhone(input: string): boolean {
  return SENEGAL_MOBILE_E164_REGEX.test(normalizeSenegalPhone(input));
}
