import {
  PERSON_NAME_REGEX,
  VOLUNTEER_CODE_REGEX,
  normalizePersonName,
  normalizeSenegalPhone,
} from './formats';

describe('formats', () => {
  it.each(['012346-00', '999999-99'])('accepts code %s', (code) => {
    expect(VOLUNTEER_CODE_REGEX.test(code)).toBe(true);
  });

  it.each([
    '12346-00',
    '012346-0',
    '0123460-0',
    'abcdef-gh',
    '012346 00',
    '01234600',
  ])('rejects code %s', (code) => {
    expect(VOLUNTEER_CODE_REGEX.test(code)).toBe(false);
  });

  it.each(['771234567', '77 123 45 67', '+221771234567', '00221 70.123.45.67'])(
    'normalizes phone %s to E.164',
    (input) => {
      expect(normalizeSenegalPhone(input)).toMatch(/^\+2217[05678]\d{7}$/);
    },
  );

  it.each(['721234567', '77123456', '+33612345678'])(
    'leaves invalid phone %s non E.164',
    (input) => {
      expect(normalizeSenegalPhone(input)).not.toMatch(/^\+2217[05678]\d{7}$/);
    },
  );

  it.each(['Aïssatou', "N'Diaye", 'Mame Diarra', 'Ba-Sow'])(
    'accepts name %s',
    (name) => {
      expect(PERSON_NAME_REGEX.test(name)).toBe(true);
    },
  );

  it.each(['A1', "'Fall", 'Ndiaye-', 'Jean@'])('rejects name %s', (name) => {
    expect(PERSON_NAME_REGEX.test(name)).toBe(false);
  });

  it('normalizes spaces and typographic apostrophes in names', () => {
    expect(normalizePersonName('  Mame   N’Diaye ')).toBe("Mame N'Diaye");
  });
});
