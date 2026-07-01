import { Inject, Injectable } from '@nestjs/common';
import {
  IVehicleRepository,
  VEHICLE_REPOSITORY,
} from '../repositories/vehicle.repository.interface';
import { UpdateVehicleDto } from '../../api/dto/update-vehicle.dto';

@Injectable()
export class UpdateVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,
  ) {}

  async execute(id: string, dto: UpdateVehicleDto) {
    return this.vehicleRepository.update(id, dto);
  }
}
