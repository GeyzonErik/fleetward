import { IBrandRepository } from '../../src/modules/brands/application/repositories/brand.repository.interface';

export function createMockBrandRepository(): jest.Mocked<IBrandRepository> {
  return {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}
