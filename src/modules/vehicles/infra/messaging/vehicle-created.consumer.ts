import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Channel, ConsumeMessage } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { RABBITMQ_CHANNEL } from '../../../../shared/messaging/rabbitmq.provider';
import { VehicleCreatedEvent } from '../../application/events/vehicle-created.event';

@Injectable()
export class VehicleCreatedConsumer implements OnModuleInit {
  private readonly logger = new Logger(VehicleCreatedConsumer.name);
  private readonly queue: string;

  constructor(
    @Inject(RABBITMQ_CHANNEL) private readonly channel: Channel,
    private readonly configService: ConfigService,
  ) {
    const queueName = this.configService.get<string>(
      'RABBITMQ_QUEUE_VEHICLE_CREATED',
    );

    if (!queueName) {
      throw new Error(
        'RABBITMQ_QUEUE_VEHICLE_CREATED environment variable is not set',
      );
    }

    this.queue = queueName;
  }

  async onModuleInit(): Promise<void> {
    await this.channel.assertQueue(this.queue, { durable: true });

    await this.channel.consume(this.queue, (message: ConsumeMessage | null) => {
      if (!message) return;

      const event = JSON.parse(
        message.content.toString(),
      ) as VehicleCreatedEvent;

      this.logger.log(
        `Vehicle created event received: ${JSON.stringify(event)}`,
      );

      this.channel.ack(message);
    });

    this.logger.log(`Listening for messages on queue "${this.queue}"`);
  }
}
