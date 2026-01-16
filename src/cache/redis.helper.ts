import { redisClient } from '@/config/redis';

export async function cacheGet<T>(key: string): Promise<T | null> {
  const data = await redisClient.get(key);
  if (!data) return null;

  try {
    return JSON.parse(data) as T;
  } catch {
    // 깨진 캐시 제거
    await redisClient.del(key);
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number) {
  await redisClient.set(key, JSON.stringify(value), {
    EX: ttlSeconds,
  });
}
