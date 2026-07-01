import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../../shared/common/entities/base.entity';
import { Model } from '../../../../models/infra/data/typeorm/model.entity';

@Entity('vehicles')
export class Vehicle extends BaseEntity {
  @Column({ name: 'license_plate', type: 'varchar', length: 10, unique: true })
  licensePlate!: string;

  @Column({ type: 'varchar', length: 17, unique: true })
  chassis!: string;

  @Column({ type: 'varchar', length: 11, unique: true })
  renavam!: string;

  @Column({ type: 'int' })
  year!: number;

  @Column({ name: 'model_id', type: 'uniqueidentifier' })
  modelId!: string;

  @ManyToOne(() => Model, (model) => model.vehicles)
  @JoinColumn({ name: 'model_id' })
  model!: Model;
}
