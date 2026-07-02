import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindModelUseCase } from '../../../../src/modules/models/application/usecases/find-model.usecase';
import { MODEL_REPOSITORY } from '../../../../src/modules/models/application/repositories/model.repository.interface';
import { createMockModelRepository } from '../../../mocks/model-repository.mock';

describe('FindModelUseCase', () => {
  let useCase: FindModelUseCase;
  let modelRepository: ReturnType<typeof createMockModelRepository>;

  beforeEach(async () => {
    modelRepository = createMockModelRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindModelUseCase,
        { provide: MODEL_REPOSITORY, useValue: modelRepository },
      ],
    }).compile();

    useCase = module.get<FindModelUseCase>(FindModelUseCase);
  });

  describe('findAll', () => {
    it('Should return all models', async () => {
      const models = [
        { id: '1', name: 'Onix' },
        { id: '2', name: 'HB20' },
      ];
      modelRepository.findAll.mockResolvedValue(models as any);

      const result = await useCase.findAll();

      expect(result).toEqual(models);
      expect(modelRepository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('Should return the model when found', async () => {
      const model = { id: '1', name: 'Onix' };
      modelRepository.findById.mockResolvedValue(model as any);

      const result = await useCase.findById('1');

      expect(result).toEqual(model);
    });

    it('Should throw NotFoundException when the model does not exist', async () => {
      modelRepository.findById.mockResolvedValue(null);

      await expect(useCase.findById('id-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
