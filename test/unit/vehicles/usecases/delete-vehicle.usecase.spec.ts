import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteVehicleUseCase } from '../../../../src/modules/vehicles/application/usecases/delete-vehicle.usecase';
import { VEHICLE_REPOSITORY } from '../../../../src/modules/vehicles/application/repositories/vehicle.repository.interface';
import { createMockVehicleRepository } from '../../../mocks/vehicle-repository.mock';

describe('DeleteVehicleUseCase', () => {
  let useCase: DeleteVehicleUseCase;
  let vehicleRepository: ReturnType<typeof createMockVehicleRepository>;

  beforeEach(async () => {
    vehicleRepository = createMockVehicleRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteVehicleUseCase,
        { provide: VEHICLE_REPOSITORY, useValue: vehicleRepository },
      ],
    }).compile();

    useCase = module.get<DeleteVehicleUseCase>(DeleteVehicleUseCase);
  });

  it('Should delete the vehicle when it exists', async () => {
    vehicleRepository.delete.mockResolvedValue(undefined);

    await useCase.execute('1');

    expect(vehicleRepository.delete).toHaveBeenCalledWith('1');
  });

  it('Should propagate NotFoundException when the vehicle does not exist', async () => {
    vehicleRepository.delete.mockRejectedValue(
      new NotFoundException('Vehicle with id "x" not found'),
    );

    await expect(useCase.execute('x')).rejects.toThrow(NotFoundException);
  });
});
