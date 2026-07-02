import { Test, TestingModule } from '@nestjs/testing';
import { UpdateModelUseCase } from '../../../../src/modules/models/application/usecases/update-model.usecase';
import { MODEL_REPOSITORY } from '../../../../src/modules/models/application/repositories/model.repository.interface';
import { createMockModelRepository } from '../../../mocks/model-repository.mock';

describe('UpdateModelUseCase', () => {
  let useCase: UpdateModelUseCase;
  let modelRepository: ReturnType<typeof createMockModelRepository>;

  beforeEach(async () => {
    modelRepository = createMockModelRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateModelUseCase,
        { provide: MODEL_REPOSITORY, useValue: modelRepository },
      ],
    }).compile();

    useCase = module.get<UpdateModelUseCase>(UpdateModelUseCase);
  });

  it('Should update the model with the provided data', async () => {
    const updatedModel = { id: '1', name: 'Onix Plus' };
    modelRepository.update.mockResolvedValue(updatedModel as any);

    const result = await useCase.execute('1', { name: 'Onix Plus' });

    expect(modelRepository.update).toHaveBeenCalledWith('1', {
      name: 'Onix Plus',
    });
    expect(result).toEqual(updatedModel);
  });

  it('Should propagate NotFoundException if the repository indicates a non-existent model', async () => {
    modelRepository.update.mockRejectedValue(
      new Error('Model with id "x" not found'),
    );

    await expect(useCase.execute('x', { name: 'any' })).rejects.toThrow();
  });
});
