import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateVehicleUseCase } from '../../../../src/modules/vehicles/application/usecases/create-vehicle.usecase';
import { VEHICLE_REPOSITORY } from '../../../../src/modules/vehicles/application/repositories/vehicle.repository.interface';
import { MODEL_REPOSITORY } from '../../../../src/modules/models/application/repositories/model.repository.interface';
import { createMockVehicleRepository } from '../../../mocks/vehicle-repository.mock';
import { createMockModelRepository } from '../../../mocks/model-repository.mock';
import { createMockVehicleEventPublisher } from '../../..//mocks/vehicle-event-publisher.mock';
import { VEHICLE_EVENT_PUBLISHER } from '../../../../src/modules/vehicles/application/messaging/vehicle-event-publisher.interface';

describe('CreateVehicleUseCase', () => {
  let useCase: CreateVehicleUseCase;
  let vehicleRepository: ReturnType<typeof createMockVehicleRepository>;
  let modelRepository: ReturnType<typeof createMockModelRepository>;
  let eventPublisher: ReturnType<typeof createMockVehicleEventPublisher>;

  const dto = {
    licensePlate: 'ABC1D23',
    chassis: '9BWZZZ377VT004251',
    renavam: '12345678901',
    year: 2023,
    modelId: 'model-1',
  };

  beforeEach(async () => {
    vehicleRepository = createMockVehicleRepository();
    modelRepository = createMockModelRepository();
    eventPublisher = createMockVehicleEventPublisher();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateVehicleUseCase,
        { provide: VEHICLE_REPOSITORY, useValue: vehicleRepository },
        { provide: MODEL_REPOSITORY, useValue: modelRepository },
        { provide: VEHICLE_EVENT_PUBLISHER, useValue: eventPublisher },
      ],
    }).compile();

    useCase = module.get<CreateVehicleUseCase>(CreateVehicleUseCase);
  });

  it('Should create a vehicle when the model exists and there is no duplication', async () => {
    modelRepository.findById.mockResolvedValue({
      id: 'model-1',
      name: 'Onix',
    } as any);
    vehicleRepository.findByPlateOrChassisOrRenavam.mockResolvedValue(null);
    const createdVehicle = {
      id: 'v1',
      ...dto,
      createdBy: 'aivacol',
      createdAt: new Date(),
    };
    vehicleRepository.create.mockResolvedValue(createdVehicle as any);

    const result = await useCase.execute(dto, 'aivacol');

    expect(modelRepository.findById).toHaveBeenCalledWith('model-1');

    expect(
      vehicleRepository.findByPlateOrChassisOrRenavam,
    ).toHaveBeenCalledWith(dto.licensePlate, dto.chassis, dto.renavam);

    expect(vehicleRepository.create).toHaveBeenCalledWith({
      ...dto,
      createdBy: 'aivacol',
    });

    expect(eventPublisher.publishVehicleCreated).toHaveBeenCalledWith({
      vehicleId: createdVehicle.id,
      licensePlate: createdVehicle.licensePlate,
      modelId: createdVehicle.modelId,
      createdBy: createdVehicle.createdBy,
      createdAt: createdVehicle.createdAt,
    });

    expect(result).toEqual(createdVehicle);
  });

  it('Should throw NotFoundException if the model does not exist', async () => {
    modelRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(dto, 'aivacol')).rejects.toThrow(
      NotFoundException,
    );

    expect(
      vehicleRepository.findByPlateOrChassisOrRenavam,
    ).not.toHaveBeenCalled();

    expect(vehicleRepository.create).not.toHaveBeenCalled();

    expect(vehicleRepository.create).not.toHaveBeenCalled();

    expect(eventPublisher.publishVehicleCreated).not.toHaveBeenCalled();
  });

  it(' Should throw ConflictException if a vehicle with the same license plate, chassis, or renavam already exists', async () => {
    modelRepository.findById.mockResolvedValue({
      id: 'model-1',
      name: 'Onix',
    } as any);

    vehicleRepository.findByPlateOrChassisOrRenavam.mockResolvedValue({
      id: 'existing',
    } as any);

    await expect(useCase.execute(dto, 'aivacol')).rejects.toThrow(
      ConflictException,
    );

    expect(vehicleRepository.create).not.toHaveBeenCalled();
  });

  it('Should return the created vehicle even if the event publication fails', async () => {
    modelRepository.findById.mockResolvedValue({
      id: 'model-1',
      name: 'Onix',
    } as any);

    vehicleRepository.findByPlateOrChassisOrRenavam.mockResolvedValue(null);

    const createdVehicle = {
      id: 'v1',
      ...dto,
      createdBy: 'aivacol',
      createdAt: new Date(),
    };

    vehicleRepository.create.mockResolvedValue(createdVehicle as any);

    eventPublisher.publishVehicleCreated.mockRejectedValue(
      new Error('RabbitMQ unavailable'),
    );

    const result = await useCase.execute(dto, 'aivacol');

    expect(result).toEqual(createdVehicle);
  });
});
