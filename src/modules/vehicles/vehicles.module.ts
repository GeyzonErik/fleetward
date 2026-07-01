import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './infra/data/typeorm/vehicle.entity';
import { ModelsModule } from '../models/models.module';
import { VehiclesController } from './api/controllers/vehicles.controller';
import { CreateVehicleUseCase } from './application/usecases/create-vehicle.usecase';
import { FindVehicleUseCase } from './application/usecases/find-vehicle.usecase';
import { UpdateVehicleUseCase } from './application/usecases/update-vehicle.usecase';
import { DeleteVehicleUseCase } from './application/usecases/delete-vehicle.usecase';
import { VEHICLE_REPOSITORY } from './application/repositories/vehicle.repository.interface';
import { VehicleTypeOrmRepository } from './infra/data/typeorm/vehicle.typeorm.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle]), ModelsModule],
  controllers: [VehiclesController],
  providers: [
    // == Use Cases ==
    CreateVehicleUseCase,
    FindVehicleUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
    // == Repositories ==
    {
      provide: VEHICLE_REPOSITORY,
      useClass: VehicleTypeOrmRepository,
    },
  ],
})
export class VehiclesModule {}
