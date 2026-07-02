import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from '../../../../src/modules/auth/api/dto/login.dto';

describe('LoginDto', () => {
  it('Should pass validation with valid data', async () => {
    const dto = plainToInstance(LoginDto, {
      nickname: 'aivacol',
      password: 'pass123',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('Should fail when password is less than 6 characters', async () => {
    const dto = plainToInstance(LoginDto, {
      nickname: 'aivacol',
      password: '123',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('Should fail when nickname is not a string', async () => {
    const dto = plainToInstance(LoginDto, { password: 'senha123' });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'nickname')).toBe(true);
  });
});
