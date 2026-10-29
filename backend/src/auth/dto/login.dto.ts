import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';
import { VOLUNTEER_CODE_REGEX } from '../../common/formats';

export class LoginDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Matches(VOLUNTEER_CODE_REGEX, {
    message: 'Le code volontaire doit être au format 012346-00.',
  })
  code!: string;
}
