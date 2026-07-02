import { Test, TestingModule } from '@nestjs/testing';
import { UpdateVehicleUseCase } from '../../../../src/modules/vehicles/application/usecases/update-vehicle.usecase';
import { VEHICLE_REPOSITORY } from '../../../../src/modules/vehicles/application/repositories/vehicle.repository.interface';
import { createMockVehicleRepository } from '../../../mocks/vehicle-repository.mock';

describe('UpdateVehicleUseCase', () => {
  let useCase: UpdateVehicleUseCase;
  let vehicleRepository: ReturnType<typeof createMockVehicleRepository>;

  beforeEach(async () => {
    vehicleRepository = createMockVehicleRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateVehicleUseCase,
        { provide: VEHICLE_REPOSITORY, useValue: vehicleRepository },
      ],
    }).compile();

    useCase = module.get<UpdateVehicleUseCase>(UpdateVehicleUseCase);
  });

  it('Should update the vehicle with the provided data', async () => {
    const updatedVehicle = { id: '1', year: 2024 };
    vehicleRepository.update.mockResolvedValue(updatedVehicle as any);

    const result = await useCase.execute('1', { year: 2024 });

    expect(vehicleRepository.update).toHaveBeenCalledWith('1', { year: 2024 });
    expect(result).toEqual(updatedVehicle);
  });

  it('Should propagate the error when the vehicle does not exist', async () => {
    vehicleRepository.update.mockRejectedValue(
      new Error('Vehicle with id "x" not found'),
    );

    await expect(useCase.execute('x', { year: 2024 })).rejects.toThrow();
  });
});
