import { redisClient } from '@/config/redis';
import { logger } from '@/config/logger';

export async function cacheGet<T>(key: string): Promise<T | null> {
  const start = Date.now();
  const data = await redisClient.get(key);
  const durationMs = Date.now() - start;

  if (!data) {
    logger.info('[CACHE][MISS]', {
      key,
      durationMs,
    });
    return null;
  }

  try {
    const parsed = JSON.parse(data) as T;

    logger.info('[CACHE][HIT]', {
      key,
      durationMs,
    });

    return parsed;
  } catch (error) {
    logger.warn('[CACHE][CORRUPTED]', {
      key,
      error,
    });

    await redisClient.del(key);
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number) {
  await redisClient.set(key, JSON.stringify(value), {
    EX: ttlSeconds,
  });

  logger.info('[CACHE][SET]', {
    key,
    ttlSeconds,
  });
}
