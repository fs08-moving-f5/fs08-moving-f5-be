import { redisClient } from '@/config/redis';
import { buildDriverDetailCacheKey } from '../keys/driverDetail.key';
import { logger } from '@/config/logger';

/**
 * 기사 상세 캐시 무효화
 *
 * 사용 시점:
 * - 기사 정보 변경
 * - 기사에 새로운 리뷰가 추가되어 평점/리뷰 수가 변하는 경우
 */
export async function invalidateDriverDetailCache(driverId: string) {
  const key = buildDriverDetailCacheKey(driverId);

  await redisClient.del(key);

  logger.info('[CACHE][INVALIDATE][DRIVER_DETAIL]', {
    driverId,
    key,
  });
}
