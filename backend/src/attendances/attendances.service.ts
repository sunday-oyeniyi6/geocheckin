import { Injectable } from '@nestjs/common';
import { todayInDakar } from '../common/dakar-date';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendancesService {
  constructor(private readonly prisma: PrismaService) {}

  async hasCheckedInToday(volunteerId: string): Promise<boolean> {
    const attendance = await this.prisma.attendance.findUnique({
      where: { volunteerId_date: { volunteerId, date: todayInDakar() } },
      select: { id: true },
    });
    return attendance !== null;
  }
}
