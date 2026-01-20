import { redisClient } from '@/config/redis';
import { DRIVER_LIST_CACHE_VERSION_KEY, DRIVER_LIST_CACHE_DEFAULT_VERSION } from '../keys/version';

export async function bumpDriverListCacheVersion() {
  const current =
    (await redisClient.get(DRIVER_LIST_CACHE_VERSION_KEY)) ?? DRIVER_LIST_CACHE_DEFAULT_VERSION;

  const currentNumber = Number(current.replace('v', '')) || 1;
  const nextVersion = `v${currentNumber + 1}`;

  await redisClient.set(DRIVER_LIST_CACHE_VERSION_KEY, nextVersion);
}
