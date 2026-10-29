const DAKAR_DATE_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Africa/Dakar',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * Date du jour à Dakar, à minuit UTC, prête pour une colonne `@db.Date`.
 * Toujours calculée côté serveur, jamais fournie par le client.
 */
export function todayInDakar(now: Date = new Date()): Date {
  return new Date(`${DAKAR_DATE_FORMAT.format(now)}T00:00:00.000Z`);
}
