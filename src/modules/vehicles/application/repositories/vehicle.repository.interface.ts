import { Vehicle } from '../../infra/data/typeorm/vehicle.entity';

export interface IVehicleRepository {
  create(data: Partial<Vehicle>): Promise<Vehicle>;
  findAll(): Promise<Vehicle[]>;
  findById(id: string): Promise<Vehicle | null>;
  findByPlateOrChassisOrRenavam(
    licensePlate: string,
    chassis: string,
    renavam: string,
  ): Promise<Vehicle | null>;
  update(id: string, data: Partial<Vehicle>): Promise<Vehicle>;
  delete(id: string): Promise<void>;
}

export const VEHICLE_REPOSITORY = 'VEHICLE_REPOSITORY';
