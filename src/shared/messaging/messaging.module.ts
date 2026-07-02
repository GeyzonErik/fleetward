import { Module } from '@nestjs/common';
import { rabbitmqProvider, RABBITMQ_CHANNEL } from './rabbitmq.provider';

@Module({
  providers: [rabbitmqProvider],
  exports: [RABBITMQ_CHANNEL],
})
export class MessagingModule {}
