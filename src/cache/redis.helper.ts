import { redisClient } from '@/config/redis';
import { logger } from '@/config/logger';

/**
 * Redis 공통 캐시 헬퍼
 *
 * - JSON 직렬화 기반 캐시 read/write
 * - HIT / MISS / CORRUPTED 로깅을 통해 캐시 상태 관측 가능
 * - CORRUPTED 발생 시 자동 삭제로 장애 전파 방지
 *
 * 주의:
 * - 값은 반드시 JSON 직렬화 가능한 객체여야 함
 */

/**
 * 캐시 조회
 *
 * @returns
 * - HIT: 파싱된 캐시 데이터
 * - MISS or CORRUPTED: null (상위 레이어에서 DB fallback 처리)
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  // 캐시 접근 시간 측정 - 네트워크 문제 추적 + Redis 병목 판단용
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

    // 캐시 깨짐 복구
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
