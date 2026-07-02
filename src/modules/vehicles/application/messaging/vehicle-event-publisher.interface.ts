import { VehicleCreatedEvent } from '../events/vehicle-created.event';

export interface IVehicleEventPublisher {
  publishVehicleCreated(event: VehicleCreatedEvent): Promise<void>;
}

export const VEHICLE_EVENT_PUBLISHER = 'VEHICLE_EVENT_PUBLISHER';
