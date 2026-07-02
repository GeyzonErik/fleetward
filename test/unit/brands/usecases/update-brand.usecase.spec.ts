import { Test, TestingModule } from '@nestjs/testing';
import { UpdateBrandUseCase } from '../../../../src/modules/brands/application/usecases/update-brand.usecase';
import { BRAND_REPOSITORY } from '../../../../src/modules/brands/application/repositories/brand.repository.interface';
import { createMockBrandRepository } from '../../../mocks/brand-repository.mock';

describe('UpdateBrandUseCase', () => {
  let useCase: UpdateBrandUseCase;
  let brandRepository: ReturnType<typeof createMockBrandRepository>;

  beforeEach(async () => {
    brandRepository = createMockBrandRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateBrandUseCase,
        { provide: BRAND_REPOSITORY, useValue: brandRepository },
      ],
    }).compile();

    useCase = module.get<UpdateBrandUseCase>(UpdateBrandUseCase);
  });

  it('Should update the brand with the provided data', async () => {
    const updatedBrand = { id: '1', name: 'Chevrolet do Brasil' };
    brandRepository.update.mockResolvedValue(updatedBrand as any);

    const result = await useCase.execute('1', { name: 'Chevrolet do Brasil' });

    expect(brandRepository.update).toHaveBeenCalledWith('1', {
      name: 'Chevrolet do Brasil',
    });
    expect(result).toEqual(updatedBrand);
  });

  it('Should propagate the error when the brand does not exist', async () => {
    brandRepository.update.mockRejectedValue(
      new Error('Brand with id "x" not found'),
    );

    await expect(useCase.execute('x', { name: 'Qualquer' })).rejects.toThrow();
  });
});
