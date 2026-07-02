import { Brand } from '../../infra/data/typeorm/brand.entity';

export interface IBrandRepository {
  create(data: Partial<Brand>): Promise<Brand>;
  findAll(): Promise<Brand[]>;
  findById(id: string): Promise<Brand | null>;
  update(id: string, data: Partial<Brand>): Promise<Brand>;
  delete(id: string): Promise<void>;
}

export const BRAND_REPOSITORY = 'BRAND_REPOSITORY';
