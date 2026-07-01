import { Model } from '../../infra/data/typeorm/model.entity';

export interface IModelRepository {
  create(data: Partial<Model>): Promise<Model>;
  findAll(): Promise<Model[]>;
  findById(id: string): Promise<Model | null>;
  update(id: string, data: Partial<Model>): Promise<Model>;
  delete(id: string): Promise<void>;
}

export const MODEL_REPOSITORY = 'MODEL_REPOSITORY';
