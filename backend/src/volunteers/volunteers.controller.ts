import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { SessionService } from '../session/session.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { toVolunteerProfile, VolunteerProfile } from './volunteer-profile';
import { VolunteersService } from './volunteers.service';

@Controller('volunteers')
export class VolunteersController {
  constructor(
    private readonly volunteers: VolunteersService,
    private readonly session: SessionService,
  ) {}

  /** Inscription : crée le volontaire puis ouvre directement sa session. */
  @Post()
  @UseGuards(ThrottlerGuard)
  async signUp(
    @Body() dto: CreateVolunteerDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VolunteerProfile> {
    const volunteer = await this.volunteers.create(dto);
    await this.session.open(res, volunteer);
    return toVolunteerProfile(volunteer);
  }
}
