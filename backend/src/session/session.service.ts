import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { CookieOptions, Response } from 'express';
import type { Volunteer } from '../generated/prisma/client';
import type { SessionPayload } from './session.types';

export const SESSION_COOKIE = 'geocheckin_session';

@Injectable()
export class SessionService {
  private readonly ttlSeconds: number;
  private readonly secure: boolean;

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    this.ttlSeconds = Number(config.get('JWT_TTL', 900));
    this.secure = config.get('NODE_ENV') === 'production';
  }

  async open(res: Response, volunteer: Volunteer): Promise<void> {
    const payload: SessionPayload = { sub: volunteer.id, code: volunteer.code };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.ttlSeconds,
    });
    res.cookie(SESSION_COOKIE, token, {
      ...this.cookieOptions(),
      maxAge: this.ttlSeconds * 1000,
    });
  }

  close(res: Response): void {
    res.clearCookie(SESSION_COOKIE, this.cookieOptions());
  }

  /** Retourne le contenu du jeton, ou null s'il est absent, invalide ou expiré. */
  async verify(token: string | undefined): Promise<SessionPayload | null> {
    if (!token) return null;
    try {
      return await this.jwt.verifyAsync<SessionPayload>(token);
    } catch {
      return null;
    }
  }

  private cookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      sameSite: 'strict',
      secure: this.secure,
      path: '/',
    };
  }
}
