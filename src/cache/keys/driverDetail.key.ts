export const DRIVER_DETAIL_CACHE_PREFIX = 'drivers:detail';

export function buildDriverDetailCacheKey(driverId: string) {
  return `${DRIVER_DETAIL_CACHE_PREFIX}:${driverId}`;
}
