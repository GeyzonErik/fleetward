import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
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
import {
  IVehicleEventPublisher,
  VEHICLE_EVENT_PUBLISHER,
} from '../messaging/vehicle-event-publisher.interface';

@Injectable()
export class CreateVehicleUseCase {
  private readonly logger = new Logger(CreateVehicleUseCase.name);

  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,
    @Inject(MODEL_REPOSITORY)
    private readonly modelRepository: IModelRepository,
    @Inject(VEHICLE_EVENT_PUBLISHER)
    private readonly eventPublisher: IVehicleEventPublisher,
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

    const vehicle = await this.vehicleRepository.create({ ...dto, createdBy });

    try {
      await this.eventPublisher.publishVehicleCreated({
        vehicleId: vehicle.id,
        licensePlate: vehicle.licensePlate,
        modelId: vehicle.modelId,
        createdBy: vehicle.createdBy,
        createdAt: vehicle.createdAt,
      });
    } catch (err) {
      this.logger.error('Failed to publish vehicle created event', err);
    }

    return vehicle;
  }
}
