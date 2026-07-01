import { Inject, Injectable } from '@nestjs/common';
import {
  IModelRepository,
  MODEL_REPOSITORY,
} from '../repositories/model.repository.interface';
import { UpdateModelDto } from '../../api/dto/update-model.dto';

@Injectable()
export class UpdateModelUseCase {
  constructor(
    @Inject(MODEL_REPOSITORY)
    private readonly modelRepository: IModelRepository,
  ) {}

  async execute(id: string, dto: UpdateModelDto) {
    return this.modelRepository.update(id, dto);
  }
}
