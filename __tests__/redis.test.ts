import 'dotenv/config';

import { redisClient } from '@/config/redis';
import { cacheGet, cacheSet } from '@/cache/redis.helper';
import { buildDriversCacheKey } from '@/cache/keys';
import { bumpDriverListCacheVersion } from '@/cache/invalidate';
import { buildDriverDetailCacheKey } from '@/cache/keys';
import { invalidateDriverDetailCache } from '@/cache/invalidate';
import type { GetDriversServiceParams } from '@/api/drivers/types';

describe('Redis Cache', () => {
  const testDriverId = 'test-driver-1';
  const testListParams: GetDriversServiceParams = {
    region: 'seoul',
    service: 'all',
    sort: 'default',
    cursor: 'none',
    limit: 10,
    search: 'none',
  };

  beforeAll(async () => {
    if (!redisClient.isOpen) {
      await redisClient.connect(); // Redis 연결
    }
  });

  afterAll(async () => {
    await redisClient.quit(); // 테스트 종료 시 Redis 연결 종료
  });

  it('should set and get cache', async () => {
    const key = await buildDriversCacheKey(testListParams);

    // set cache
    await redisClient.set(key, JSON.stringify({ message: 'hello' }), { EX: 60 });

    // get cache
    const cached = await redisClient.get(key);
    expect(cached).not.toBeNull();
    expect(JSON.parse(cached!)).toEqual({ message: 'hello' });
  });

  it('should bump driver list cache version', async () => {
    const before = await redisClient.get('drivers:list:version');
    await bumpDriverListCacheVersion();
    const after = await redisClient.get('drivers:list:version');
    expect(after).not.toEqual(before);
  });

  it('should invalidate driver detail cache', async () => {
    const key = `drivers:detail:${testDriverId}`;
    await redisClient.set(key, JSON.stringify({ dummy: 123 }), { EX: 60 });

    await invalidateDriverDetailCache(testDriverId);

    const cached = await redisClient.get(key);
    expect(cached).toBeNull();
  });
});

// tests/.env.test 생성 후 테스트 (.env와 같은 내용)
// npx jest tests/redis.test.ts
