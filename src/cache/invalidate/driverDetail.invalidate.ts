import { redisClient } from '@/config/redis';
import { buildDriverDetailCacheKey } from '../keys/driverDetail.key';
import { logger } from '@/config/logger';

export async function invalidateDriverDetailCache(driverId: string) {
  const key = buildDriverDetailCacheKey(driverId);

  await redisClient.del(key);

  logger.info('[CACHE][INVALIDATE][DRIVER_DETAIL]', {
    driverId,
    key,
  });
}
