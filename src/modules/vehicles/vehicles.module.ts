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
import { VEHICLE_CACHE } from './application/cache/vehicle-cache.interface';
import { VehicleRedisCacheService } from './infra/cache/vehicle-redis-cache.service';
import { VehicleCachedRepository } from './infra/data/typeorm/vehicle-cached.repository';
import { CacheModule } from 'src/shared/cache/cache.module';
import { MessagingModule } from 'src/shared/messaging/messaging.module';
import { VehicleCreatedConsumer } from './infra/messaging/vehicle-created.consumer';
import { VEHICLE_EVENT_PUBLISHER } from './application/messaging/vehicle-event-publisher.interface';
import { VehicleRabbitmqPublisher } from './infra/messaging/vehicle-rabbitmq-publisher.service';
import { VehicleDeletedConsumer } from './infra/messaging/vehicle-deleted.consumer';

const VEHICLE_REPOSITORY_TYPEORM = 'VEHICLE_REPOSITORY_TYPEORM';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle]),
    ModelsModule,
    CacheModule,
    MessagingModule,
  ],
  controllers: [VehiclesController],
  providers: [
    // == Use Cases ==
    CreateVehicleUseCase,
    FindVehicleUseCase,
    UpdateVehicleUseCase,
    DeleteVehicleUseCase,
    // == Messaging ==
    VehicleCreatedConsumer,
    VehicleDeletedConsumer,
    {
      provide: VEHICLE_EVENT_PUBLISHER,
      useClass: VehicleRabbitmqPublisher,
    },
    // == Repositories ==
    {
      provide: VEHICLE_REPOSITORY_TYPEORM,
      useClass: VehicleTypeOrmRepository,
    },
    {
      provide: VEHICLE_CACHE,
      useClass: VehicleRedisCacheService,
    },
    {
      provide: VEHICLE_REPOSITORY,
      useFactory: (repository, cache) => {
        return new VehicleCachedRepository(repository, cache);
      },
      inject: [VEHICLE_REPOSITORY_TYPEORM, VEHICLE_CACHE],
    },
  ],
})
export class VehiclesModule {}
