import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from './model.entity';
import { IModelRepository } from '../../../application/repositories/model.repository.interface';

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

    await this.repository.delete(id);
  }
}
