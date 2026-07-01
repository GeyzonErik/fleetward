import { Vehicle } from '../../infra/data/typeorm/vehicle.entity';

export interface IVehicleCache {
  get(key: string): Promise<Vehicle | Vehicle[] | null>;
  set(key: string, value: Vehicle | Vehicle[]): Promise<void>;
  invalidateAll(): Promise<void>;
}

export const VEHICLE_CACHE = 'VEHICLE_CACHE';
