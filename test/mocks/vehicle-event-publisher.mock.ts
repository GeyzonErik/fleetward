import { IVehicleEventPublisher } from '../../src/modules/vehicles/application/messaging/vehicle-event-publisher.interface';

export function createMockVehicleEventPublisher(): jest.Mocked<IVehicleEventPublisher> {
  return {
    publishVehicleCreated: jest.fn(),
    publishVehicleDeleted: jest.fn(),
  };
}
