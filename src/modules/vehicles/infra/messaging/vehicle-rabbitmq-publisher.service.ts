import { Inject, Injectable, Logger } from '@nestjs/common';
import { Channel } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { RABBITMQ_CHANNEL } from '../../../../shared/messaging/rabbitmq.provider';
import { IVehicleEventPublisher } from '../../application/messaging/vehicle-event-publisher.interface';
import { VehicleCreatedEvent } from '../../application/events/vehicle-created.event';

@Injectable()
export class VehicleRabbitmqPublisher implements IVehicleEventPublisher {
  private readonly logger = new Logger(VehicleRabbitmqPublisher.name);
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

  async publishVehicleCreated(event: VehicleCreatedEvent): Promise<void> {
    await this.channel.assertQueue(this.queue, { durable: true });

    this.channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(event)), {
      persistent: true,
    });

    this.logger.log(
      `Event published to "${this.queue}": vehicle ${event.vehicleId}`,
    );
  }
}
