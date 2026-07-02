import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DeleteBrandUseCase } from '../../../../src/modules/brands/application/usecases/delete-brand.usecase';
import { BRAND_REPOSITORY } from '../../../../src/modules/brands/application/repositories/brand.repository.interface';
import { createMockBrandRepository } from '../../../mocks/brand-repository.mock';

describe('DeleteBrandUseCase', () => {
  let useCase: DeleteBrandUseCase;
  let brandRepository: ReturnType<typeof createMockBrandRepository>;

  beforeEach(async () => {
    brandRepository = createMockBrandRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteBrandUseCase,
        { provide: BRAND_REPOSITORY, useValue: brandRepository },
      ],
    }).compile();

    useCase = module.get<DeleteBrandUseCase>(DeleteBrandUseCase);
  });

  it('Should delete the brand when there are no dependencies', async () => {
    brandRepository.delete.mockResolvedValue(undefined);

    await useCase.execute('1');

    expect(brandRepository.delete).toHaveBeenCalledWith('1');
  });

  it('Should propagate NotFoundException when the brand does not exist', async () => {
    brandRepository.delete.mockRejectedValue(
      new NotFoundException('Brand with id "x" not found'),
    );

    await expect(useCase.execute('x')).rejects.toThrow(NotFoundException);
  });

  it('Should propagate ConflictException when there are associated models', async () => {
    brandRepository.delete.mockRejectedValue(
      new ConflictException(
        'Cannot remove this brand because there are models associated with it',
      ),
    );

    await expect(useCase.execute('1')).rejects.toThrow(ConflictException);
  });
});
