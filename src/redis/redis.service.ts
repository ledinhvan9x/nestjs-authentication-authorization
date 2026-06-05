import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.module';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private redis: Redis) {}

  get(key: string) {
    return this.redis.get(key);
  }

  set(key: string, value: any, ttl?: number) {
    return this.redis.set(
      key,
      JSON.stringify(value),
      ttl ? 'EX' : undefined,
      ttl,
    );
  }

  del(key: string) {
    return this.redis.del(key);
  }
}
