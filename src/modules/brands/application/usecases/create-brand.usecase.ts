import { Inject, Injectable } from '@nestjs/common';
import {
  IBrandRepository,
  BRAND_REPOSITORY,
} from '../repositories/brand.repository.interface';
import { CreateBrandDto } from '../../api/dto/create-brand.dto';

@Injectable()
export class CreateBrandUseCase {
  constructor(
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: IBrandRepository,
  ) {}

  async execute(dto: CreateBrandDto, createdBy: string) {
    return this.brandRepository.create({ ...dto, createdBy });
  }
}
