export interface VehicleCreatedEvent {
  vehicleId: string;
  licensePlate: string;
  modelId: string;
  createdBy: string;
  createdAt: Date;
}
