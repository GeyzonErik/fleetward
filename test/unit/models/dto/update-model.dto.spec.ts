import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateModelDto } from '../../../../src/modules/models/api/dto/update-model.dto';

describe('UpdateModelDto', () => {
  it('Should pass validation when no fields are sent (all optional)', async () => {
    const dto = plainToInstance(UpdateModelDto, {});

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('Should fail when name is sent but invalid', async () => {
    const dto = plainToInstance(UpdateModelDto, { name: 'A' });

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
  });
});
