import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { VolunteersModule } from './volunteers/volunteers.module';

@Module({
  imports: [
    // Le fichier .env unique est à la racine du dépôt (scripts lancés depuis /backend).
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] }),
    // Appliqué uniquement aux routes décorées avec @UseGuards(ThrottlerGuard).
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: Number(config.get('THROTTLE_TTL_MS', 60_000)),
          limit: Number(config.get('THROTTLE_LIMIT', 30)),
        },
      ],
    }),
    PrismaModule,
    HealthModule,
    VolunteersModule,
    AuthModule,
  ],
})
export class AppModule {}
