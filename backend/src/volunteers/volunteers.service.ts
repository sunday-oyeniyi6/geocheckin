import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, type Volunteer } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';

export type VolunteerConflictField = 'code' | 'phone';

@Injectable()
export class VolunteersService {
  constructor(private readonly prisma: PrismaService) {}

  findByCode(code: string): Promise<Volunteer | null> {
    return this.prisma.volunteer.findUnique({ where: { code } });
  }

  findById(id: string): Promise<Volunteer | null> {
    return this.prisma.volunteer.findUnique({ where: { id } });
  }

  async create(dto: CreateVolunteerDto): Promise<Volunteer> {
    const existing = await this.prisma.volunteer.findMany({
      where: { OR: [{ code: dto.code }, { phone: dto.phone }] },
      select: { code: true, phone: true },
    });
    const fields: VolunteerConflictField[] = [];
    if (existing.some((v) => v.code === dto.code)) fields.push('code');
    if (existing.some((v) => v.phone === dto.phone)) fields.push('phone');
    if (fields.length > 0) throw volunteerConflict(fields);

    try {
      return await this.prisma.volunteer.create({ data: dto });
    } catch (error) {
      // Inscription concurrente entre la vérification et l'insertion.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw volunteerConflict([]);
      }
      throw error;
    }
  }
}

function volunteerConflict(
  fields: VolunteerConflictField[],
): ConflictException {
  return new ConflictException({
    statusCode: 409,
    error: 'VOLUNTEER_ALREADY_EXISTS',
    message: 'Un volontaire est déjà inscrit avec ce code ou ce numéro.',
    fields,
  });
}
