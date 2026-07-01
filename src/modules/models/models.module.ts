import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Model } from './infra/data/typeorm/model.entity';
import { ModelsController } from './api/controllers/models.controller';
import { CreateModelUseCase } from './application/usecases/create-model.usecase';
import { FindModelUseCase } from './application/usecases/find-model.usecase';
import { UpdateModelUseCase } from './application/usecases/update-model.usecase';
import { DeleteModelUseCase } from './application/usecases/delete-model.usecase';
import { MODEL_REPOSITORY } from './application/repositories/model.repository.interface';
import { ModelTypeOrmRepository } from './infra/data/typeorm/model.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Model])],
  controllers: [ModelsController],
  providers: [
    // == Use Cases==
    CreateModelUseCase,
    FindModelUseCase,
    UpdateModelUseCase,
    DeleteModelUseCase,
    // == Repositories ==
    {
      provide: MODEL_REPOSITORY,
      useClass: ModelTypeOrmRepository,
    },
  ],
  exports: [MODEL_REPOSITORY],
})
export class ModelsModule {}
