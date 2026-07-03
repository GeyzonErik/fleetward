import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteVehicleUseCase } from '../../../../src/modules/vehicles/application/usecases/delete-vehicle.usecase';
import { VEHICLE_REPOSITORY } from '../../../../src/modules/vehicles/application/repositories/vehicle.repository.interface';
import { createMockVehicleRepository } from '../../../mocks/vehicle-repository.mock';
import { createMockVehicleEventPublisher } from '../../../mocks/vehicle-event-publisher.mock';
import { VEHICLE_EVENT_PUBLISHER } from '../../../../src/modules/vehicles/application/messaging/vehicle-event-publisher.interface';

describe('DeleteVehicleUseCase', () => {
  let useCase: DeleteVehicleUseCase;
  let vehicleRepository: ReturnType<typeof createMockVehicleRepository>;
  let eventPublisher: ReturnType<typeof createMockVehicleEventPublisher>;

  beforeEach(async () => {
    vehicleRepository = createMockVehicleRepository();
    eventPublisher = createMockVehicleEventPublisher();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteVehicleUseCase,
        { provide: VEHICLE_REPOSITORY, useValue: vehicleRepository },
        { provide: VEHICLE_EVENT_PUBLISHER, useValue: eventPublisher },
      ],
    }).compile();

    useCase = module.get<DeleteVehicleUseCase>(DeleteVehicleUseCase);
  });

  it('Should delete the vehicle and publish the deletion event', async () => {
    vehicleRepository.findById.mockResolvedValue({
      id: '1',
      licensePlate: 'ABC1D23',
    } as any);

    vehicleRepository.delete.mockResolvedValue(undefined);

    await useCase.execute('1', 'aivacol');

    expect(vehicleRepository.delete).toHaveBeenCalledWith('1');

    expect(eventPublisher.publishVehicleDeleted).toHaveBeenCalledWith(
      expect.objectContaining({
        vehicleId: '1',
        licensePlate: 'ABC1D23',
        deletedBy: 'aivacol',
      }),
    );
  });

  it('Should throw NotFoundException when the vehicle does not exist', async () => {
    vehicleRepository.findById.mockResolvedValue(null);

    vehicleRepository.delete.mockRejectedValue(
      new NotFoundException('Vehicle with ID x not found'),
    );

    await expect(useCase.execute('x', 'aivacol')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('Should delete the vehicle even if the event publishing fails', async () => {
    vehicleRepository.findById.mockResolvedValue({
      id: '1',
      licensePlate: 'ABC1D23',
    } as any);

    vehicleRepository.delete.mockResolvedValue(undefined);

    eventPublisher.publishVehicleDeleted.mockRejectedValue(
      new Error('RabbitMQ connection failed'),
    );

    await expect(useCase.execute('1', 'aivacol')).resolves.not.toThrow();
  });
});
