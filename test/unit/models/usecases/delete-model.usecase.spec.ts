import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DeleteModelUseCase } from '../../../../src/modules/models/application/usecases/delete-model.usecase';
import { MODEL_REPOSITORY } from '../../../../src/modules/models/application/repositories/model.repository.interface';
import { createMockModelRepository } from '../../../mocks/model-repository.mock';

describe('DeleteModelUseCase', () => {
  let useCase: DeleteModelUseCase;
  let modelRepository: ReturnType<typeof createMockModelRepository>;

  beforeEach(async () => {
    modelRepository = createMockModelRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteModelUseCase,
        { provide: MODEL_REPOSITORY, useValue: modelRepository },
      ],
    }).compile();

    useCase = module.get<DeleteModelUseCase>(DeleteModelUseCase);
  });

  it('Should delete the model when there are no dependencies', async () => {
    modelRepository.delete.mockResolvedValue(undefined);

    await useCase.execute('1');

    expect(modelRepository.delete).toHaveBeenCalledWith('1');
  });

  it('Should propagate NotFoundException when the model does not exist', async () => {
    modelRepository.delete.mockRejectedValue(
      new NotFoundException('Model with id "x" not found'),
    );

    await expect(useCase.execute('x')).rejects.toThrow(NotFoundException);
  });

  it('Should propagate ConflictException when there are associated vehicles', async () => {
    modelRepository.delete.mockRejectedValue(
      new ConflictException(
        'Cannot remove this model because there are vehicles associated with it',
      ),
    );

    await expect(useCase.execute('1')).rejects.toThrow(ConflictException);
  });
});
