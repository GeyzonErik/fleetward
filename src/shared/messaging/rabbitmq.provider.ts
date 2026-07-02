import * as amqp from 'amqplib';
import { ConfigService } from '@nestjs/config';

export const RABBITMQ_CHANNEL = 'RABBITMQ_CHANNEL';

export const rabbitmqProvider = {
  provide: RABBITMQ_CHANNEL,
  useFactory: async (configService: ConfigService) => {
    const user = configService.getOrThrow<string>('RABBITMQ_USER');
    const password = configService.getOrThrow<string>('RABBITMQ_PASSWORD');
    const host = configService.getOrThrow<string>('RABBITMQ_HOST');
    const port = configService.getOrThrow<string>('RABBITMQ_PORT');

    const connection = await amqp.connect(
      `amqp://${user}:${password}@${host}:${port}`,
    );

    return connection.createChannel();
  },
  inject: [ConfigService],
};
