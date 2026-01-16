import { GetDriversServiceParams } from '@/api/drivers/types/index';

export function buildDriversCacheKey(params: GetDriversServiceParams) {
  const {
    region = 'all',
    service = 'all',
    sort = 'default',
    cursor = 'none',
    limit = 15,
    search = 'none',
  } = params;

  const normalizedCursor = typeof cursor === 'string' && cursor.length > 0 ? cursor : 'none';

  const normalizedSearch =
    typeof search === 'string' && search.length > 0 ? encodeURIComponent(search) : 'none';

  return [
    'drivers:list:v1',
    `region=${region}`,
    `service=${service}`,
    `sort=${sort}`,
    `cursor=${normalizedCursor}`,
    `limit=${limit}`,
    `search=${normalizedSearch}`,
  ].join(':');
}
