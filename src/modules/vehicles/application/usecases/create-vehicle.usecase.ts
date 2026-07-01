import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  IVehicleRepository,
  VEHICLE_REPOSITORY,
} from '../repositories/vehicle.repository.interface';
import {
  IModelRepository,
  MODEL_REPOSITORY,
} from '../../../models/application/repositories/model.repository.interface';
import { CreateVehicleDto } from '../../api/dto/create-vehicle.dto';

@Injectable()
export class CreateVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,
    @Inject(MODEL_REPOSITORY)
    private readonly modelRepository: IModelRepository,
  ) {}

  async execute(dto: CreateVehicleDto, createdBy: string) {
    const model = await this.modelRepository.findById(dto.modelId);

    if (!model) {
      throw new NotFoundException(`Model with id "${dto.modelId}" not found`);
    }

    const existing = await this.vehicleRepository.findByPlateOrChassisOrRenavam(
      dto.licensePlate,
      dto.chassis,
      dto.renavam,
    );

    if (existing) {
      throw new ConflictException(
        'Veículo com essa placa, chassi ou renavam já cadastrado',
      );
    }

    return this.vehicleRepository.create({ ...dto, createdBy });
  }
}
