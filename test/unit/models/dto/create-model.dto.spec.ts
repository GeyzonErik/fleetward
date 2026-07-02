import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateModelDto } from '../../../../src/modules/models/api/dto/create-model.dto';

describe('CreateModelDto', () => {
  it('Should pass validation with valid data', async () => {
    const dto = plainToInstance(CreateModelDto, { name: 'Onix' });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('Should fail when name is empty', async () => {
    const dto = plainToInstance(CreateModelDto, { name: '' });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('name');
  });

  it('Should fail when name has less than 2 characters', async () => {
    const dto = plainToInstance(CreateModelDto, { name: 'A' });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });

  it('Should fail when name isnt a string', async () => {
    const dto = plainToInstance(CreateModelDto, { name: 12345 });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
