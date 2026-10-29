import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { CurrentVolunteer } from '../session/current-volunteer.decorator';
import { JwtAuthGuard } from '../session/jwt-auth.guard';
import { SessionService } from '../session/session.service';
import type { SessionPayload } from '../session/session.types';
import {
  toVolunteerProfile,
  VolunteerProfile,
} from '../volunteers/volunteer-profile';
import { AuthService, MeResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly session: SessionService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VolunteerProfile> {
    const volunteer = await this.auth.findVolunteerForLogin(dto.code);
    await this.session.open(res, volunteer);
    return toVolunteerProfile(volunteer);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentVolunteer() session: SessionPayload): Promise<MeResponse> {
    return this.auth.me(session);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response): void {
    this.session.close(res);
  }
}
