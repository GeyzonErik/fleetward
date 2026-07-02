import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindBrandUseCase } from '../../../../src/modules/brands/application/usecases/find-brand.usecase';
import { BRAND_REPOSITORY } from '../../../../src/modules/brands/application/repositories/brand.repository.interface';
import { createMockBrandRepository } from '../../../mocks/brand-repository.mock';

describe('FindBrandUseCase', () => {
  let useCase: FindBrandUseCase;
  let brandRepository: ReturnType<typeof createMockBrandRepository>;

  beforeEach(async () => {
    brandRepository = createMockBrandRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindBrandUseCase,
        { provide: BRAND_REPOSITORY, useValue: brandRepository },
      ],
    }).compile();

    useCase = module.get<FindBrandUseCase>(FindBrandUseCase);
  });

  describe('findAll', () => {
    it('Should return all brands', async () => {
      const brands = [
        { id: '1', name: 'Chevrolet' },
        { id: '2', name: 'Fiat' },
      ];
      brandRepository.findAll.mockResolvedValue(brands as any);

      const result = await useCase.findAll();

      expect(result).toEqual(brands);
    });
  });

  describe('findById', () => {
    it('Should return the brand when found', async () => {
      const brand = { id: '1', name: 'Chevrolet' };
      brandRepository.findById.mockResolvedValue(brand as any);

      const result = await useCase.findById('1');

      expect(result).toEqual(brand);
    });

    it('Should throw NotFoundException when the brand does not exist', async () => {
      brandRepository.findById.mockResolvedValue(null);

      await expect(useCase.findById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
