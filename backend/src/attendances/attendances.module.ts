import { Module } from '@nestjs/common';
import { AttendancesService } from './attendances.service';

@Module({
  providers: [AttendancesService],
  exports: [AttendancesService],
})
export class AttendancesModule {}
