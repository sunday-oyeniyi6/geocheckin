import { Transform } from 'class-transformer';
import { IsString, Length, Matches } from 'class-validator';
import {
  PERSON_NAME_MAX_LENGTH,
  PERSON_NAME_MIN_LENGTH,
  PERSON_NAME_REGEX,
  SENEGAL_MOBILE_E164_REGEX,
  VOLUNTEER_CODE_REGEX,
  normalizePersonName,
  normalizeSenegalPhone,
} from '../../common/formats';

const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

const personName = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? normalizePersonName(value) : value;

export class CreateVolunteerDto {
  @Transform(personName)
  @IsString()
  @Length(PERSON_NAME_MIN_LENGTH, PERSON_NAME_MAX_LENGTH, {
    message: 'Le prénom doit contenir entre 2 et 50 caractères.',
  })
  @Matches(PERSON_NAME_REGEX, {
    message: 'Le prénom contient des caractères invalides.',
  })
  firstName!: string;

  @Transform(personName)
  @IsString()
  @Length(PERSON_NAME_MIN_LENGTH, PERSON_NAME_MAX_LENGTH, {
    message: 'Le nom doit contenir entre 2 et 50 caractères.',
  })
  @Matches(PERSON_NAME_REGEX, {
    message: 'Le nom contient des caractères invalides.',
  })
  lastName!: string;

  @Transform(trim)
  @IsString()
  @Matches(VOLUNTEER_CODE_REGEX, {
    message: 'Le code volontaire doit être au format 012346-00.',
  })
  code!: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? normalizeSenegalPhone(value) : value,
  )
  @IsString()
  @Matches(SENEGAL_MOBILE_E164_REGEX, {
    message: 'Le numéro doit être un mobile sénégalais (70, 75, 76, 77 ou 78).',
  })
  phone!: string;
}
