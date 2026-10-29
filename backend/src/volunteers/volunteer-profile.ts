import type { Volunteer } from '../generated/prisma/client';

/** Données du volontaire exposées par l'API (sans id interne ni téléphone). */
export interface VolunteerProfile {
  code: string;
  firstName: string;
  lastName: string;
}

export function toVolunteerProfile(volunteer: Volunteer): VolunteerProfile {
  return {
    code: volunteer.code,
    firstName: volunteer.firstName,
    lastName: volunteer.lastName,
  };
}
