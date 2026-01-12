import { Prisma, RegionEnum, ServiceEnum } from '@/generated/client';

export const regionMap = {
  seoul: '서울',
  gyeonggi: '경기',
  incheon: '인천',
  gangwon: '강원',
  chungbuk: '충북',
  chungnam: '충남',
  daejeon: '대전',
  sejong: '세종',
  jeonbuk: '전북',
  jeonnam: '전남',
  gwangju: '광주',
  gyeongbuk: '경북',
  gyeongnam: '경남',
  daegu: '대구',
  busan: '부산',
  ulsan: '울산',
  jeju: '제주',
};

export function isRegionKey(value: string): value is keyof typeof regionMap {
  return value in regionMap;
}

export type RegionKey = keyof typeof regionMap;

export interface GetDriversServiceParams {
  userId?: string;
  region?: RegionKey;
  service?: string;
  sort?: string;
  cursor?: string;
  limit?: number;
  search?: string;
}

export interface GetDriverStatusesRepositoryParams {
  orderBy?: Record<string, string>;
  cursor?: string;
  limit?: number;
  driverIds?: string[];
  tx?: Prisma.TransactionClient;
}

export interface GetFilteredDriverIdsParams {
  where: Prisma.UserWhereInput;
  tx?: Prisma.TransactionClient;
}

export interface GetDriverInfoRepositoryParams {
  driverIds: string[];
  tx?: Prisma.TransactionClient;
}

export interface UpdateDriverOfficeBody {
  officeAddress: string;
  officeZoneCode?: string;
  officeSido?: string;
  officeSigungu?: string;
}
