import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../../../shared/common/entities/base.entity';
import { Vehicle } from '../../../../vehicles/infra/data/typeorm/vehicle.entity';

@Entity('models')
export class Model extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.model)
  vehicles!: Vehicle[];
}
