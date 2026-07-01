import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IModelRepository,
  MODEL_REPOSITORY,
} from '../repositories/model.repository.interface';

@Injectable()
export class FindModelUseCase {
  constructor(
    @Inject(MODEL_REPOSITORY)
    private readonly modelRepository: IModelRepository,
  ) {}

  async findAll() {
    return this.modelRepository.findAll();
  }

  async findById(id: string) {
    const model = await this.modelRepository.findById(id);

    if (!model) {
      throw new NotFoundException(`Model with id "${id}" not found`);
    }

    return model;
  }
}
