import { IModelRepository } from '../../src/modules/models/application/repositories/model.repository.interface';

export function createMockModelRepository(): jest.Mocked<IModelRepository> {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}
