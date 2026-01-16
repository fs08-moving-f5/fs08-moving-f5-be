import { redisClient } from '@/config/redis';
import { GetDriversServiceParams } from '@/api/drivers/types/index';
import { DRIVER_LIST_CACHE_VERSION_KEY, DRIVER_LIST_CACHE_DEFAULT_VERSION } from './version';

export async function buildDriversCacheKey(params: GetDriversServiceParams) {
  const {
    region = 'all',
    service = 'all',
    sort = 'default',
    cursor = 'none',
    limit = 15,
    search = 'none',
  } = params;

  const version =
    (await redisClient.get(DRIVER_LIST_CACHE_VERSION_KEY)) ?? DRIVER_LIST_CACHE_DEFAULT_VERSION;

  const normalizedCursor = typeof cursor === 'string' && cursor.length > 0 ? cursor : 'none';

  const normalizedSearch =
    typeof search === 'string' && search.length > 0 ? encodeURIComponent(search) : 'none';

  return [
    'drivers:list',
    version,
    `region=${region}`,
    `service=${service}`,
    `sort=${sort}`,
    `cursor=${normalizedCursor}`,
    `limit=${limit}`,
    `search=${normalizedSearch}`,
  ].join(':');
}
