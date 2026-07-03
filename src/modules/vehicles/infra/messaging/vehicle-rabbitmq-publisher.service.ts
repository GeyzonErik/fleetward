import { Inject, Injectable, Logger } from '@nestjs/common';
import { Channel } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { RABBITMQ_CHANNEL } from '../../../../shared/messaging/rabbitmq.provider';
import { IVehicleEventPublisher } from '../../application/messaging/vehicle-event-publisher.interface';
import { VehicleCreatedEvent } from '../../application/events/vehicle-created.event';
import { VehicleDeletedEvent } from '../../application/events/vehicle-deleted.event';

@Injectable()
export class VehicleRabbitmqPublisher implements IVehicleEventPublisher {
  private readonly logger = new Logger(VehicleRabbitmqPublisher.name);
  private readonly createdQueue: string;
  private readonly deletedQueue: string;

  constructor(
    @Inject(RABBITMQ_CHANNEL) private readonly channel: Channel,
    private readonly configService: ConfigService,
  ) {
    this.createdQueue = this.configService.getOrThrow<string>(
      'RABBITMQ_QUEUE_VEHICLE_CREATED',
    );

    this.deletedQueue = this.configService.getOrThrow<string>(
      'RABBITMQ_QUEUE_VEHICLE_DELETED',
    );
  }

  async publishVehicleCreated(event: VehicleCreatedEvent): Promise<void> {
    await this.publish(this.createdQueue, event);
  }

  async publishVehicleDeleted(event: VehicleDeletedEvent): Promise<void> {
    await this.publish(this.deletedQueue, event);
  }

  private async publish(queue: string, payload: unknown): Promise<void> {
    await this.channel.assertQueue(queue, { durable: true });

    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });

    this.logger.log(`Event published to "${queue}"`);
  }
}
