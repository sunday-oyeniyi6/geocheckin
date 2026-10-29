import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SESSION_COOKIE, SessionService } from './session.service';
import type { AuthenticatedRequest } from './session.types';

describe('JwtAuthGuard', () => {
  const session = { verify: jest.fn() };
  const guard = new JwtAuthGuard(session as unknown as SessionService);

  function contextFor(
    request: Partial<AuthenticatedRequest>,
  ): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => jest.resetAllMocks());

  it('attaches the session payload when the cookie is valid', async () => {
    const payload = { sub: 'v1', code: '012346-00' };
    session.verify.mockResolvedValue(payload);
    const request: Partial<AuthenticatedRequest> = {
      cookies: { [SESSION_COOKIE]: 'token' },
    };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(session.verify).toHaveBeenCalledWith('token');
    expect(request.volunteer).toEqual(payload);
  });

  it('rejects a missing, invalid or expired cookie', async () => {
    session.verify.mockResolvedValue(null);

    await expect(
      guard.canActivate(contextFor({ cookies: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
