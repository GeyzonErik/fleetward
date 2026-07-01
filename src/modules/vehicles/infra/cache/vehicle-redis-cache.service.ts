import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../../../shared/cache/redis.provider';
import { IVehicleCache } from '../../application/cache/vehicle-cache.interface';
import { Vehicle } from '../data/typeorm/vehicle.entity';

const CACHE_KEY_PREFIX = 'vehicles';

@Injectable()
export class VehicleRedisCacheService implements IVehicleCache {
  private readonly ttlSeconds: number;

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {
    const ttl = this.configService.get<string>('CACHE_TTL_SECONDS');

    if (!ttl) {
      throw new Error('CACHE_TTL_SECONDS is not defined in the configuration');
    }

    this.ttlSeconds = parseInt(ttl, 10);
  }

  async get(key: string): Promise<Vehicle | Vehicle[] | null> {
    const cached = await this.redis.get(`${CACHE_KEY_PREFIX}:${key}`);

    if (!cached) return null;

    return JSON.parse(cached) as Vehicle | Vehicle[];
  }

  async set(key: string, value: Vehicle | Vehicle[]): Promise<void> {
    await this.redis.set(
      `${CACHE_KEY_PREFIX}:${key}`,
      JSON.stringify(value),
      'EX',
      this.ttlSeconds,
    );
  }

  async invalidateAll(): Promise<void> {
    const keys = await this.redis.keys(`${CACHE_KEY_PREFIX}:*`);

    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
