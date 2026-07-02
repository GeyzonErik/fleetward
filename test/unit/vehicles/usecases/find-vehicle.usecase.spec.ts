import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindVehicleUseCase } from '../../../../src/modules/vehicles/application/usecases/find-vehicle.usecase';
import { VEHICLE_REPOSITORY } from '../../../../src/modules/vehicles/application/repositories/vehicle.repository.interface';
import { createMockVehicleRepository } from '../../../mocks/vehicle-repository.mock';

describe('FindVehicleUseCase', () => {
  let useCase: FindVehicleUseCase;
  let vehicleRepository: ReturnType<typeof createMockVehicleRepository>;

  beforeEach(async () => {
    vehicleRepository = createMockVehicleRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindVehicleUseCase,
        { provide: VEHICLE_REPOSITORY, useValue: vehicleRepository },
      ],
    }).compile();

    useCase = module.get<FindVehicleUseCase>(FindVehicleUseCase);
  });

  describe('findAll', () => {
    it('Should return all vehicles', async () => {
      const vehicles = [{ id: '1' }, { id: '2' }];
      vehicleRepository.findAll.mockResolvedValue(vehicles as any);

      const result = await useCase.findAll();

      expect(result).toEqual(vehicles);
    });
  });

  describe('findById', () => {
    it('Should return the vehicle when found', async () => {
      const vehicle = { id: '1' };
      vehicleRepository.findById.mockResolvedValue(vehicle as any);

      const result = await useCase.findById('1');

      expect(result).toEqual(vehicle);
    });

    it('Should throw NotFoundException if the vehicle does not exist', async () => {
      vehicleRepository.findById.mockResolvedValue(null);

      await expect(useCase.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
