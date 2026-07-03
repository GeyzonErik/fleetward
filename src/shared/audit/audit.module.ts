import { Module } from '@nestjs/common';
import { mongoProvider, MONGO_DB } from './mongo.provider';

@Module({
  providers: [mongoProvider],
  exports: [MONGO_DB],
})
export class AuditModule {}
