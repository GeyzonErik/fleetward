import { Inject, Injectable } from '@nestjs/common';
import {
  IModelRepository,
  MODEL_REPOSITORY,
} from '../repositories/model.repository.interface';
import { CreateModelDto } from '../../api/dto/create-model.dto';

@Injectable()
export class CreateModelUseCase {
  constructor(
    @Inject(MODEL_REPOSITORY)
    private readonly modelRepository: IModelRepository,
  ) {}

  async execute(dto: CreateModelDto, createdBy: string) {
    return this.modelRepository.create({ ...dto, createdBy });
  }
}
