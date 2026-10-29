import { Module } from '@nestjs/common';
import { AttendancesModule } from '../attendances/attendances.module';
import { SessionModule } from '../session/session.module';
import { VolunteersModule } from '../volunteers/volunteers.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [SessionModule, VolunteersModule, AttendancesModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
