const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface VolunteerProfile {
  code: string;
  firstName: string;
  lastName: string;
}

export interface Me extends VolunteerProfile {
  checkedInToday: boolean;
}

export interface SignUpInput {
  firstName: string;
  lastName: string;
  code: string;
  phone: string;
}

export type ConflictField = "code" | "phone";

export type ApiError =
  | { kind: "not_found" }
  | { kind: "conflict"; fields: ConflictField[] }
  | { kind: "invalid" }
  | { kind: "unauthenticated" }
  | { kind: "rate_limited" }
  | { kind: "network" }
  | { kind: "unknown" };

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      // La session vit uniquement dans le cookie httpOnly posé par l'API.
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...init.headers },
    });
  } catch {
    return { ok: false, error: { kind: "network" } };
  }

  if (response.ok) {
    const data = (response.status === 204 ? undefined : await response.json()) as T;
    return { ok: true, data };
  }

  switch (response.status) {
    case 400:
      return { ok: false, error: { kind: "invalid" } };
    case 401:
      return { ok: false, error: { kind: "unauthenticated" } };
    case 404:
      return { ok: false, error: { kind: "not_found" } };
    case 409: {
      const body = (await response.json().catch(() => ({}))) as {
        fields?: ConflictField[];
      };
      return { ok: false, error: { kind: "conflict", fields: body.fields ?? [] } };
    }
    case 429:
      return { ok: false, error: { kind: "rate_limited" } };
    default:
      return { ok: false, error: { kind: "unknown" } };
  }
}

export function login(code: string): Promise<ApiResult<VolunteerProfile>> {
  return request("/auth/login", { method: "POST", body: JSON.stringify({ code }) });
}

export function signUp(input: SignUpInput): Promise<ApiResult<VolunteerProfile>> {
  return request("/volunteers", { method: "POST", body: JSON.stringify(input) });
}

export function getMe(): Promise<ApiResult<Me>> {
  return request("/auth/me");
}

export function logout(): Promise<ApiResult<void>> {
  return request("/auth/logout", { method: "POST" });
}

/** Message générique en français pour les erreurs non spécifiques à un formulaire. */
export function genericErrorMessage(error: ApiError): string {
  switch (error.kind) {
    case "rate_limited":
      return "Trop de tentatives. Patientez une minute puis réessayez.";
    case "network":
      return "Connexion impossible. Vérifiez votre réseau puis réessayez.";
    case "invalid":
      return "Certaines informations sont invalides. Vérifiez votre saisie.";
    default:
      return "Une erreur est survenue. Réessayez dans un instant.";
  }
}
