import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Brand } from './brand.entity';
import { IBrandRepository } from '../../../application/repositories/brand.repository.interface';

interface SqlDriverError {
  driverError?: {
    number?: number;
  };
}

@Injectable()
export class BrandTypeOrmRepository implements IBrandRepository {
  constructor(
    @InjectRepository(Brand)
    private readonly repository: Repository<Brand>,
  ) {}

  async create(data: Partial<Brand>): Promise<Brand> {
    const brand = this.repository.create(data);
    return this.repository.save(brand);
  }

  async findAll(): Promise<Brand[]> {
    return this.repository.find();
  }

  async findById(id: string): Promise<Brand | null> {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<Brand>): Promise<Brand> {
    const brand = await this.findById(id);

    if (!brand) {
      throw new NotFoundException(`Brand with id "${id}" not found`);
    }

    Object.assign(brand, data);
    return this.repository.save(brand);
  }

  async delete(id: string): Promise<void> {
    const brand = await this.findById(id);

    if (!brand) {
      throw new NotFoundException(`Brand with id "${id}" not found`);
    }

    try {
      await this.repository.delete(id);
    } catch (error) {
      if (this.isForeignKeyViolation(error)) {
        throw new ConflictException(
          'Cannot remove this brand because there are models associated with it',
        );
      }

      throw error;
    }
  }

  private isForeignKeyViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const dbError = error as unknown as SqlDriverError;
    const sqlServerForeignKeyCode = 547;

    return dbError.driverError?.number === sqlServerForeignKeyCode;
  }
}
