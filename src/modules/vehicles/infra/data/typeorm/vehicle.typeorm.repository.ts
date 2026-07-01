import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { IVehicleRepository } from '../../../application/repositories/vehicle.repository.interface';

@Injectable()
export class VehicleTypeOrmRepository implements IVehicleRepository {
  constructor(
    @InjectRepository(Vehicle)
    private readonly repository: Repository<Vehicle>,
  ) {}

  async create(data: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = this.repository.create(data);
    return this.repository.save(vehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return this.repository.find({ relations: { model: true } });
  }

  async findById(id: string): Promise<Vehicle | null> {
    return this.repository.findOne({
      where: { id },
      relations: { model: true },
    });
  }

  async findByPlateOrChassisOrRenavam(
    licensePlate: string,
    chassis: string,
    renavam: string,
  ): Promise<Vehicle | null> {
    return this.repository
      .createQueryBuilder('vehicle')
      .where('vehicle.license_plate = :licensePlate', { licensePlate })
      .orWhere('vehicle.chassis = :chassis', { chassis })
      .orWhere('vehicle.renavam = :renavam', { renavam })
      .getOne();
  }

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const vehicle = await this.findById(id);

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" not found`);
    }

    Object.assign(vehicle, data);
    return this.repository.save(vehicle);
  }

  async delete(id: string): Promise<void> {
    const vehicle = await this.findById(id);

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id "${id}" not found`);
    }

    await this.repository.delete(id);
  }
}
