import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import dataSource from './data-source';
import { User } from '../../modules/users/infra/data/typeorm/user.entity';
import { Brand } from '../../modules/brands/infra/data/typeorm/brand.entity';
import { Model } from '../../modules/models/infra/data/typeorm/model.entity';
import { Vehicle } from '../../modules/vehicles/infra/data/typeorm/vehicle.entity';

interface VehicleSeedData {
  brandName: string;
  modelName: string;
  licensePlate: string;
  chassis: string;
  renavam: string;
  year: number;
}

async function seedUser(): Promise<void> {
  const userRepository = dataSource.getRepository(User);

  const existing = await userRepository.findOne({
    where: { nickname: 'aivacol' },
  });

  if (existing) {
    console.log('User "aivacol" already exists, user seed skipped.');
    return;
  }

  const hashedPassword = await bcrypt.hash('Aivacol@2026', 10);

  const user = userRepository.create({
    nickname: 'aivacol',
    name: 'Aivacol Admin',
    email: 'admin@aivacol.com',
    password: hashedPassword,
    createdBy: 'seed',
  });

  await userRepository.save(user);

  console.log('User "aivacol" created successfully.');
  console.log('Login: aivacol / Password: Aivacol@2026');
}

async function seedVehicles(): Promise<void> {
  const brandRepository = dataSource.getRepository(Brand);
  const modelRepository = dataSource.getRepository(Model);
  const vehicleRepository = dataSource.getRepository(Vehicle);

  const filePath = path.join(__dirname, '../../../seed_vehicles.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');

  const vehiclesData = (JSON.parse(rawData) || []) as VehicleSeedData[];

  for (const item of vehiclesData) {
    if (!item.brandName || !item.modelName) {
      console.warn(
        `Skipping invalid entry (missing brandName or modelName): ${JSON.stringify(item)}`,
      );
      continue;
    }

    const existingVehicle = await vehicleRepository.findOne({
      where: { licensePlate: item.licensePlate },
    });

    if (existingVehicle) {
      console.log(`Vehicle "${item.licensePlate}" already exists, skipped.`);
      continue;
    }

    let brand = await brandRepository.findOne({
      where: { name: item.brandName },
    });

    if (!brand) {
      brand = brandRepository.create({
        name: item.brandName,
        createdBy: 'seed',
      });
      brand = await brandRepository.save(brand);
      console.log(`Brand "${item.brandName}" created.`);
    }

    let model = await modelRepository.findOne({
      where: { name: item.modelName, brandId: brand.id },
    });

    if (!model) {
      model = modelRepository.create({
        name: item.modelName,
        brandId: brand.id,
        createdBy: 'seed',
      });
      model = await modelRepository.save(model);
      console.log(`Model "${item.modelName}" created.`);
    }

    const vehicle = vehicleRepository.create({
      licensePlate: item.licensePlate,
      chassis: item.chassis,
      renavam: item.renavam,
      year: item.year,
      modelId: model.id,
      createdBy: 'seed',
    });

    await vehicleRepository.save(vehicle);
    console.log(`Vehicle "${item.licensePlate}" created.`);
  }
}

async function seed() {
  await dataSource.initialize();

  await seedUser();
  await seedVehicles();

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Error running seed:', error);
  process.exit(1);
});
