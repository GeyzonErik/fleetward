import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './infra/data/typeorm/brand.entity';
import { BrandsController } from './api/controllers/brands.controller';
import { CreateBrandUseCase } from './application/usecases/create-brand.usecase';
import { FindBrandUseCase } from './application/usecases/find-brand.usecase';
import { UpdateBrandUseCase } from './application/usecases/update-brand.usecase';
import { DeleteBrandUseCase } from './application/usecases/delete-brand.usecase';
import { BrandTypeOrmRepository } from './infra/data/typeorm/brand.typeorm.repository';
import { BRAND_REPOSITORY } from './application/repositories/brand.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([Brand])],
  controllers: [BrandsController],
  providers: [
    CreateBrandUseCase,
    FindBrandUseCase,
    UpdateBrandUseCase,
    DeleteBrandUseCase,
    {
      provide: BRAND_REPOSITORY,
      useClass: BrandTypeOrmRepository,
    },
  ],
})
export class BrandsModule {}
