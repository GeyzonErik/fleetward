import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../../shared/common/entities/base.entity';
import { Model } from '../../../../models/infra/data/typeorm/model.entity';

@Entity('brands')
export class Brand extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @OneToMany(() => Model, (model) => model.brand)
  models!: Model[];
}
