import { Inject, Injectable } from '@nestjs/common';
import {
  IModelRepository,
  MODEL_REPOSITORY,
} from '../repositories/model.repository.interface';

@Injectable()
export class DeleteModelUseCase {
  constructor(
    @Inject(MODEL_REPOSITORY)
    private readonly modelRepository: IModelRepository,
  ) {}

  async execute(id: string) {
    return this.modelRepository.delete(id);
  }
}
