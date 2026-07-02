import { Test, TestingModule } from '@nestjs/testing';
import { CreateModelUseCase } from '../../../../src/modules/models/application/usecases/create-model.usecase';
import { MODEL_REPOSITORY } from '../../../../src/modules/models/application/repositories/model.repository.interface';
import { createMockModelRepository } from '../../../mocks/model-repository.mock';

describe('CreateModelUseCase', () => {
  let useCase: CreateModelUseCase;
  let modelRepository: ReturnType<typeof createMockModelRepository>;

  beforeEach(async () => {
    modelRepository = createMockModelRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateModelUseCase,
        { provide: MODEL_REPOSITORY, useValue: modelRepository },
      ],
    }).compile();

    useCase = module.get<CreateModelUseCase>(CreateModelUseCase);
  });

  it('Should create a model with the correct data and createdBy from the authenticated user', async () => {
    const dto = { name: 'Onix' };
    const createdBy = 'aivacol';
    const expectedModel = { id: 'uuid-1', ...dto, createdBy };

    modelRepository.create.mockResolvedValue(expectedModel as any);

    const result = await useCase.execute(dto, createdBy);

    expect(modelRepository.create).toHaveBeenCalledWith({
      ...dto,
      createdBy,
    });
    expect(modelRepository.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedModel);
  });

  it('Should propagate the error if the repository fails', async () => {
    modelRepository.create.mockRejectedValue(new Error('DB unavailable'));

    await expect(useCase.execute({ name: 'Onix' }, 'aivacol')).rejects.toThrow(
      'DB unavailable',
    );
  });
});
