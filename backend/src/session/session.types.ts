import type { Request } from 'express';

/** Contenu du JWT de session. */
export interface SessionPayload {
  sub: string;
  code: string;
}

export interface AuthenticatedRequest extends Request {
  volunteer: SessionPayload;
}
