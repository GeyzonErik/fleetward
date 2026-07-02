import { IVehicleRepository } from '../../src/modules/vehicles/application/repositories/vehicle.repository.interface';

export function createMockVehicleRepository(): jest.Mocked<IVehicleRepository> {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByPlateOrChassisOrRenavam: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}
