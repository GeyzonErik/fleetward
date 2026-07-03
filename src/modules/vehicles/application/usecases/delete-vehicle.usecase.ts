import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  IVehicleRepository,
  VEHICLE_REPOSITORY,
} from '../repositories/vehicle.repository.interface';
import {
  IVehicleEventPublisher,
  VEHICLE_EVENT_PUBLISHER,
} from '../messaging/vehicle-event-publisher.interface';

@Injectable()
export class DeleteVehicleUseCase {
  private readonly logger = new Logger(DeleteVehicleUseCase.name);

  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,
    @Inject(VEHICLE_EVENT_PUBLISHER)
    private readonly eventPublisher: IVehicleEventPublisher,
  ) {}

  async execute(id: string, deletedBy: string) {
    const vehicle = await this.vehicleRepository.findById(id);

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    await this.vehicleRepository.delete(vehicle.id);

    try {
      await this.eventPublisher.publishVehicleDeleted({
        vehicleId: id,
        licensePlate: vehicle?.licensePlate ?? 'unknown',
        deletedBy,
        deletedAt: new Date(),
      });
    } catch (err) {
      this.logger.error(
        `Failed to publish vehicle deleted event for vehicle ID ${vehicle.id}:`,
        err,
      );
    }
  }
}
