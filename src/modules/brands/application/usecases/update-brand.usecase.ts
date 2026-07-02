import { Inject, Injectable } from '@nestjs/common';
import {
  IBrandRepository,
  BRAND_REPOSITORY,
} from '../repositories/brand.repository.interface';
import { UpdateBrandDto } from '../../api/dto/update-brand.dto';

@Injectable()
export class UpdateBrandUseCase {
  constructor(
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: IBrandRepository,
  ) {}

  async execute(id: string, dto: UpdateBrandDto) {
    return this.brandRepository.update(id, dto);
  }
}
