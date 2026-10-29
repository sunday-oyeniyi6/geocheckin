import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('accepts a valid code with surrounding spaces', async () => {
    const dto = plainToInstance(LoginDto, { code: ' 012346-00 ' });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.code).toBe('012346-00');
  });

  it.each(['012346-0', 'abcdef-gh', '', 12346])('rejects %p', async (code) => {
    const dto = plainToInstance(LoginDto, { code });
    expect(await validate(dto)).not.toHaveLength(0);
  });
});
