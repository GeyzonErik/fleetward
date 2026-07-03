import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Channel, ConsumeMessage } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { RABBITMQ_CHANNEL } from '../../../../shared/messaging/rabbitmq.provider';
import { VehicleDeletedEvent } from '../../application/events/vehicle-deleted.event';

@Injectable()
export class VehicleDeletedConsumer implements OnModuleInit {
  private readonly logger = new Logger(VehicleDeletedConsumer.name);
  private readonly queue: string;

  constructor(
    @Inject(RABBITMQ_CHANNEL) private readonly channel: Channel,
    private readonly configService: ConfigService,
  ) {
    this.queue = this.configService.getOrThrow<string>(
      'RABBITMQ_QUEUE_VEHICLE_DELETED',
    );
  }

  async onModuleInit(): Promise<void> {
    await this.channel.assertQueue(this.queue, { durable: true });

    await this.channel.consume(this.queue, (message: ConsumeMessage | null) => {
      if (!message) return;

      const event = JSON.parse(
        message.content.toString(),
      ) as VehicleDeletedEvent;

      this.logger.log(
        `Vehicle deleted event received: ${JSON.stringify(event)}`,
      );

      this.channel.ack(message);
    });

    this.logger.log(`Listening for messages on queue "${this.queue}"`);
  }
}
