import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './infra/data/typeorm/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
})
export class UsersModule {}
