import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../../shared/common/entities/base.entity';
import { Vehicle } from '../../../../vehicles/infra/data/typeorm/vehicle.entity';
import { Brand } from '../../../../brands/infra/data/typeorm/brand.entity';

@Entity('models')
export class Model extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name!: string;

  @Column({ name: 'brand_id', type: 'uniqueidentifier', nullable: true })
  brandId!: string | null;

  @ManyToOne(() => Brand, (brand) => brand.models, { nullable: true })
  @JoinColumn({ name: 'brand_id' })
  brand!: Brand;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.model)
  vehicles!: Vehicle[];
}
