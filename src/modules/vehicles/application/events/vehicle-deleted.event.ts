export interface VehicleDeletedEvent {
  vehicleId: string;
  licensePlate: string;
  deletedBy: string;
  deletedAt: Date;
}
