import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IVehicleRepository,
  VEHICLE_REPOSITORY,
} from '../repositories/vehicle.repository.interface';

@Injectable()
export class FindVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async findAll() {
    return this.vehicleRepository.findAll();
  }

  async findById(id: string) {
    const vehicle = await this.vehicleRepository.findById(id);

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" not found`);
    }

    return vehicle;
  }
}
