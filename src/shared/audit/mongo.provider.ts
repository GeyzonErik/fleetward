import { MongoClient, Db } from 'mongodb';
import { ConfigService } from '@nestjs/config';

export const MONGO_DB = 'MONGO_DB';

export const mongoProvider = {
  provide: MONGO_DB,
  useFactory: async (configService: ConfigService): Promise<Db> => {
    const user = configService.getOrThrow<string>('MONGO_USER');
    const password = configService.getOrThrow<string>('MONGO_PASSWORD');
    const host = configService.getOrThrow<string>('MONGO_HOST');
    const port = configService.getOrThrow<string>('MONGO_PORT');
    const database = configService.getOrThrow<string>('MONGO_DATABASE');

    const client = new MongoClient(
      `mongodb://${user}:${password}@${host}:${port}/?authSource=admin`,
    );

    await client.connect();

    return client.db(database);
  },
  inject: [ConfigService],
};
