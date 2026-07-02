import { Test, TestingModule } from '@nestjs/testing';
import { CreateBrandUseCase } from '../../../../src/modules/brands/application/usecases/create-brand.usecase';
import { BRAND_REPOSITORY } from '../../../../src/modules/brands/application/repositories/brand.repository.interface';
import { createMockBrandRepository } from '../../../mocks/brand-repository.mock';

describe('CreateBrandUseCase', () => {
  let useCase: CreateBrandUseCase;
  let brandRepository: ReturnType<typeof createMockBrandRepository>;

  beforeEach(async () => {
    brandRepository = createMockBrandRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBrandUseCase,
        { provide: BRAND_REPOSITORY, useValue: brandRepository },
      ],
    }).compile();

    useCase = module.get<CreateBrandUseCase>(CreateBrandUseCase);
  });

  it('Should create a brand with the correct data and createdBy coming from the authenticated user', async () => {
    const dto = { name: 'Chevrolet' };
    const createdBy = 'aivacol';
    const expectedBrand = { id: 'uuid-1', ...dto, createdBy };

    brandRepository.create.mockResolvedValue(expectedBrand as any);

    const result = await useCase.execute(dto, createdBy);

    expect(brandRepository.create).toHaveBeenCalledWith({ ...dto, createdBy });
    expect(result).toEqual(expectedBrand);
  });

  it('Should propagate the error if the repository fails', async () => {
    brandRepository.create.mockRejectedValue(new Error('DB unavailable'));

    await expect(
      useCase.execute({ name: 'Chevrolet' }, 'aivacol'),
    ).rejects.toThrow('DB unavailable');
  });
});
