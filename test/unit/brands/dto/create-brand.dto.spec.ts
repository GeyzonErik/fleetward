import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateBrandDto } from '../../../../src/modules/brands/api/dto/create-brand.dto';

describe('CreateBrandDto', () => {
  it('Should pass validation with valid data', async () => {
    const dto = plainToInstance(CreateBrandDto, { name: 'Chevrolet' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('Should fail when name is empty', async () => {
    const dto = plainToInstance(CreateBrandDto, { name: '' });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('Should fail when name is less than 2 characters', async () => {
    const dto = plainToInstance(CreateBrandDto, { name: 'A' });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
