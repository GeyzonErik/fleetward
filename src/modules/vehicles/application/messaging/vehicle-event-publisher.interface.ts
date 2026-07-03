import { VehicleCreatedEvent } from '../events/vehicle-created.event';
import { VehicleDeletedEvent } from '../events/vehicle-deleted.event';

export interface IVehicleEventPublisher {
  publishVehicleCreated(event: VehicleCreatedEvent): Promise<void>;
  publishVehicleDeleted(event: VehicleDeletedEvent): Promise<void>;
}

export const VEHICLE_EVENT_PUBLISHER = 'VEHICLE_EVENT_PUBLISHER';
