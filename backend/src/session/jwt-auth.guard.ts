import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SESSION_COOKIE, SessionService } from './session.service';
import type { AuthenticatedRequest } from './session.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly session: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const cookies = request.cookies as Record<string, string> | undefined;
    const payload = await this.session.verify(cookies?.[SESSION_COOKIE]);
    if (!payload) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'UNAUTHENTICATED',
        message: 'Session absente ou expirée.',
      });
    }
    request.volunteer = payload;
    return true;
  }
}
