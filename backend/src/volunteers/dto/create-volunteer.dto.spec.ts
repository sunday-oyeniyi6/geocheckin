import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateVolunteerDto } from './create-volunteer.dto';

const valid = {
  firstName: 'Aïssatou',
  lastName: "N'Diaye",
  code: '012346-00',
  phone: '77 123 45 67',
};

async function errorsFor(input: Record<string, unknown>): Promise<string[]> {
  const dto = plainToInstance(CreateVolunteerDto, input);
  return (await validate(dto)).map((e) => e.property);
}

describe('CreateVolunteerDto', () => {
  it('accepts valid data and normalizes the phone to E.164', async () => {
    const dto = plainToInstance(CreateVolunteerDto, valid);
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.phone).toBe('+221771234567');
  });

  it('trims and collapses spaces in names', () => {
    const dto = plainToInstance(CreateVolunteerDto, {
      ...valid,
      firstName: '  Mame   Diarra ',
    });
    expect(dto.firstName).toBe('Mame Diarra');
  });

  it.each([
    ['code', '12346-00'],
    ['code', '01234600'],
    ['phone', '721234567'],
    ['phone', '77123456'],
    ['firstName', 'A'],
    ['firstName', 'Jean3'],
    ['lastName', 'x'.repeat(51)],
  ])('rejects invalid %s "%s"', async (field, value) => {
    expect(await errorsFor({ ...valid, [field]: value })).toEqual([field]);
  });

  it('rejects missing fields', async () => {
    expect(await errorsFor({})).toEqual(
      expect.arrayContaining(['firstName', 'lastName', 'code', 'phone']),
    );
  });
});
