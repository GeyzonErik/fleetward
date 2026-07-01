import { Inject, Injectable } from '@nestjs/common';
import { Vehicle } from './vehicle.entity';
import {
  IVehicleRepository,
  VEHICLE_REPOSITORY,
} from '../../../application/repositories/vehicle.repository.interface';
import {
  IVehicleCache,
  VEHICLE_CACHE,
} from '../../../application/cache/vehicle-cache.interface';

@Injectable()
export class VehicleCachedRepository implements IVehicleRepository {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly repository: IVehicleRepository,
    @Inject(VEHICLE_CACHE)
    private readonly cache: IVehicleCache,
  ) {}

  async create(data: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = await this.repository.create(data);
    await this.cache.invalidateAll();
    return vehicle;
  }

  async findAll(): Promise<Vehicle[]> {
    const cached = await this.cache.get('all');

    if (cached) {
      return cached as Vehicle[];
    }

    const vehicles = await this.repository.findAll();
    await this.cache.set('all', vehicles);
    return vehicles;
  }

  async findById(id: string): Promise<Vehicle | null> {
    const cached = await this.cache.get(id);

    if (cached) {
      return cached as Vehicle;
    }

    const vehicle = await this.repository.findById(id);

    if (vehicle) {
      await this.cache.set(id, vehicle);
    }

    return vehicle;
  }

  async findByPlateOrChassisOrRenavam(
    licensePlate: string,
    chassis: string,
    renavam: string,
  ): Promise<Vehicle | null> {
    return this.repository.findByPlateOrChassisOrRenavam(
      licensePlate,
      chassis,
      renavam,
    );
  }

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = await this.repository.update(id, data);
    await this.cache.invalidateAll();
    return vehicle;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
    await this.cache.invalidateAll();
  }
}
