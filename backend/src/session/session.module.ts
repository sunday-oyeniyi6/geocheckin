import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SessionService } from './session.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow<string>('JWT_SECRET');
        if (
          config.get('NODE_ENV') === 'production' &&
          (secret === 'change-me-in-production' || secret.length < 32)
        ) {
          throw new Error('JWT_SECRET doit être un secret fort en production.');
        }
        return { secret };
      },
    }),
  ],
  providers: [SessionService, JwtAuthGuard],
  exports: [SessionService, JwtAuthGuard],
})
export class SessionModule {}
