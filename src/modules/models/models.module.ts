import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Model } from './infra/data/typeorm/model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Model])],
})
export class ModelsModule {}
