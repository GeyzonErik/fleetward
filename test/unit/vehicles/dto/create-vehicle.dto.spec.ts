import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateVehicleDto } from '../../../../src/modules/vehicles/api/dto/create-vehicle.dto';

describe('CreateVehicleDto', () => {
  const validPayload = {
    licensePlate: 'ABC1D23',
    chassis: '9BWZZZ377VT004251',
    renavam: '12345678901',
    year: 2023,
    modelId: 'model-1',
  };

  it('Should pass validation with valid data', async () => {
    const dto = plainToInstance(CreateVehicleDto, validPayload);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('It should fail when chassis is not exactly 17 characters', async () => {
    const dto = plainToInstance(CreateVehicleDto, {
      ...validPayload,
      chassis: 'CURTO',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'chassis')).toBe(true);
  });

  it('Should fail when renavam is not exactly 11 characters', async () => {
    const dto = plainToInstance(CreateVehicleDto, {
      ...validPayload,
      renavam: '123',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'renavam')).toBe(true);
  });

  it('Should fail when year is less than 1950', async () => {
    const dto = plainToInstance(CreateVehicleDto, {
      ...validPayload,
      year: 1900,
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'year')).toBe(true);
  });

  it('Should fail when year is not an integer', async () => {
    const dto = plainToInstance(CreateVehicleDto, {
      ...validPayload,
      year: 'two thousand twenty-three',
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === 'year')).toBe(true);
  });
});
