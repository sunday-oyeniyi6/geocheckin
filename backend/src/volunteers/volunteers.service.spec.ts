import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VolunteersService } from './volunteers.service';

describe('VolunteersService', () => {
  const prisma = {
    volunteer: { findMany: jest.fn(), create: jest.fn() },
  };
  const service = new VolunteersService(prisma as unknown as PrismaService);
  const dto = {
    firstName: 'Awa',
    lastName: 'Fall',
    code: '012346-00',
    phone: '+221771234567',
  };

  beforeEach(() => jest.resetAllMocks());

  it('creates the volunteer when code and phone are free', async () => {
    prisma.volunteer.findMany.mockResolvedValue([]);
    prisma.volunteer.create.mockResolvedValue({ id: '1', ...dto });

    await expect(service.create(dto)).resolves.toMatchObject({ id: '1' });
    expect(prisma.volunteer.create).toHaveBeenCalledWith({ data: dto });
  });

  it.each([
    [[{ code: dto.code, phone: '+221700000000' }], ['code']],
    [[{ code: '999999-99', phone: dto.phone }], ['phone']],
    [[{ code: dto.code, phone: dto.phone }], ['code', 'phone']],
  ])('returns 409 with the conflicting fields', async (existing, fields) => {
    prisma.volunteer.findMany.mockResolvedValue(existing);

    const error = await service.create(dto).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ConflictException);
    expect((error as ConflictException).getResponse()).toMatchObject({
      error: 'VOLUNTEER_ALREADY_EXISTS',
      fields,
    });
    expect(prisma.volunteer.create).not.toHaveBeenCalled();
  });
});
