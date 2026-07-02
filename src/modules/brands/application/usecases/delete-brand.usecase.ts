import { Inject, Injectable } from '@nestjs/common';
import {
  IBrandRepository,
  BRAND_REPOSITORY,
} from '../repositories/brand.repository.interface';

@Injectable()
export class DeleteBrandUseCase {
  constructor(
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: IBrandRepository,
  ) {}

  async execute(id: string) {
    return this.brandRepository.delete(id);
  }
}
