import { redisClient } from '@/config/redis';
import { GetDriversServiceParams } from '@/api/drivers/types/index';
import { DRIVER_LIST_CACHE_VERSION_KEY, DRIVER_LIST_CACHE_DEFAULT_VERSION } from './version';

/**
 * 기사 목록 캐시 키 생성
 *
 * - 검색/필터/페이지네이션 조건을 모두 키에 포함
 * - Redis key explosion 방지를 위해 값 정규화 수행
 * - version prefix를 통해 전체 목록 캐시 일괄 무효화 가능
 */
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
