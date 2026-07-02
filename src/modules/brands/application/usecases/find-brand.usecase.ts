import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IBrandRepository,
  BRAND_REPOSITORY,
} from '../repositories/brand.repository.interface';

@Injectable()
export class FindBrandUseCase {
  constructor(
    @Inject(BRAND_REPOSITORY)
    private readonly brandRepository: IBrandRepository,
  ) {}

  async findAll() {
    return this.brandRepository.findAll();
  }

  async findById(id: string) {
    const brand = await this.brandRepository.findById(id);

    if (!brand) {
      throw new NotFoundException(`Brand with id "${id}" not found`);
    }

    return brand;
  }
}
