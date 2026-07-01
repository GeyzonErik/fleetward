import { Inject, Injectable } from '@nestjs/common';
import {
  IVehicleRepository,
  VEHICLE_REPOSITORY,
} from '../repositories/vehicle.repository.interface';

@Injectable()
export class DeleteVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(id: string) {
    return this.vehicleRepository.delete(id);
  }
}
