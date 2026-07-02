import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateVehicleDto } from '../../../../src/modules/vehicles/api/dto/update-vehicle.dto';

describe('UpdateVehicleDto', () => {
  it('Should pass validation when no fields are sent (all optional)', async () => {
    const dto = plainToInstance(UpdateVehicleDto, {});

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('Should fail when year is sent but invalid', async () => {
    const dto = plainToInstance(UpdateVehicleDto, { year: 1900 });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
