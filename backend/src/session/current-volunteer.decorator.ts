import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest, SessionPayload } from './session.types';

/** Volontaire de la session courante (nécessite JwtAuthGuard). */
export const CurrentVolunteer = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SessionPayload =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().volunteer,
);
