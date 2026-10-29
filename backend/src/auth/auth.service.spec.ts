import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AttendancesService } from '../attendances/attendances.service';
import { VolunteersService } from '../volunteers/volunteers.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const volunteers = { findByCode: jest.fn(), findById: jest.fn() };
  const attendances = { hasCheckedInToday: jest.fn() };
  const service = new AuthService(
    volunteers as unknown as VolunteersService,
    attendances as unknown as AttendancesService,
  );
  const volunteer = {
    id: 'v1',
    code: '012346-00',
    firstName: 'Awa',
    lastName: 'Fall',
    phone: '+221771234567',
    createdAt: new Date(),
  };

  beforeEach(() => jest.resetAllMocks());

  it('finds a registered volunteer by code', async () => {
    volunteers.findByCode.mockResolvedValue(volunteer);
    await expect(service.findVolunteerForLogin('012346-00')).resolves.toBe(
      volunteer,
    );
  });

  it('throws VOLUNTEER_NOT_FOUND for an unknown code', async () => {
    volunteers.findByCode.mockResolvedValue(null);
    const error = await service
      .findVolunteerForLogin('999999-99')
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(NotFoundException);
    expect((error as NotFoundException).getResponse()).toMatchObject({
      error: 'VOLUNTEER_NOT_FOUND',
    });
  });

  it('returns the profile without phone, with checkedInToday', async () => {
    volunteers.findById.mockResolvedValue(volunteer);
    attendances.hasCheckedInToday.mockResolvedValue(true);

    await expect(service.me({ sub: 'v1', code: '012346-00' })).resolves.toEqual(
      {
        code: '012346-00',
        firstName: 'Awa',
        lastName: 'Fall',
        checkedInToday: true,
      },
    );
  });

  it('rejects a session whose volunteer no longer exists', async () => {
    volunteers.findById.mockResolvedValue(null);
    await expect(
      service.me({ sub: 'gone', code: '012346-00' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
