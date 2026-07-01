import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Model } from './model.entity';
import { IModelRepository } from '../../../application/repositories/model.repository.interface';

interface SqlDriverError {
  driverError?: {
    number?: number;
  };
}

@Injectable()
export class ModelTypeOrmRepository implements IModelRepository {
  constructor(
    @InjectRepository(Model)
    private readonly repository: Repository<Model>,
  ) {}

  async create(data: Partial<Model>): Promise<Model> {
    const model = this.repository.create(data);
    return this.repository.save(model);
  }

  async findAll(): Promise<Model[]> {
    return this.repository.find();
  }

  async findById(id: string): Promise<Model | null> {
    return this.repository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<Model>): Promise<Model> {
    const model = await this.findById(id);

    if (!model) {
      throw new NotFoundException(`Model with id "${id}" not found`);
    }

    Object.assign(model, data);
    return this.repository.save(model);
  }

  async delete(id: string): Promise<void> {
    const model = await this.findById(id);

    if (!model) {
      throw new NotFoundException(`Model with id "${id}" not found`);
    }

    try {
      await this.repository.delete(id);
    } catch (err) {
      if (this.isForeignKeyViolation(err)) {
        throw new ConflictException(
          'Cannot remove this model because there are vehicles associated with it',
        );
      }

      throw err;
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
