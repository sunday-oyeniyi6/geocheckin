import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AttendancesService } from '../attendances/attendances.service';
import type { Volunteer } from '../generated/prisma/client';
import type { SessionPayload } from '../session/session.types';
import {
  toVolunteerProfile,
  VolunteerProfile,
} from '../volunteers/volunteer-profile';
import { VolunteersService } from '../volunteers/volunteers.service';

export interface MeResponse extends VolunteerProfile {
  checkedInToday: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly volunteers: VolunteersService,
    private readonly attendances: AttendancesService,
  ) {}

  async findVolunteerForLogin(code: string): Promise<Volunteer> {
    const volunteer = await this.volunteers.findByCode(code);
    if (!volunteer) {
      throw new NotFoundException({
        statusCode: 404,
        error: 'VOLUNTEER_NOT_FOUND',
        message: 'Aucun compte pour ce code.',
      });
    }
    return volunteer;
  }

  async me(session: SessionPayload): Promise<MeResponse> {
    const volunteer = await this.volunteers.findById(session.sub);
    if (!volunteer) {
      throw new UnauthorizedException({
        statusCode: 401,
        error: 'UNAUTHENTICATED',
        message: 'Session absente ou expirée.',
      });
    }
    return {
      ...toVolunteerProfile(volunteer),
      checkedInToday: await this.attendances.hasCheckedInToday(volunteer.id),
    };
  }
}
