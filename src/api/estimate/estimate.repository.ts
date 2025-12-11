// 예시 파일입니다. 자유롭게 사용하세요.
import prisma from '../../config/prisma';
import { Prisma } from '../../generated/client';
import { ServiceEnum, EstimateStatus } from '../../generated/enums';

const DEFAULT_TAKE = 6;

export type EstimateSort = 'latest' | 'oldest' | 'moving-latest' | 'moving-oldest';
export interface GetEstimateRequestsParams {
  userId: string;
  driverId: string;
  movingType?: ServiceEnum;
  movingDate?: Date;
  isDesignated?: boolean;
  status?: EstimateStatus;
  serviceRegionFilter?: boolean; // 체크박스 상태

  search?: string;
  sort?: EstimateSort;
  cursor?: string | null;
  take?: number | string;
}

// 받은 요청 리스트 조회(기사)
export async function getEstimateRequests({
  userId,
  driverId,
  movingType,
  movingDate,
  isDesignated = false,
  status,
  serviceRegionFilter,
  search,
  sort = 'latest',
  cursor,
  take = DEFAULT_TAKE,
}: GetEstimateRequestsParams) {
  // take를 숫자로 변환
  const parsedTake = typeof take === 'string' ? parseInt(take, 10) : take;
  const finalTake = isNaN(parsedTake) ? DEFAULT_TAKE : parsedTake;

  // 드라이버 프로필 regions 조회
  const driverProfile = await prisma.driverProfile.findUnique({
    where: { driverId },
    select: { regions: true },
  });

  if (!driverProfile) return [];

  const driverRegions = driverProfile.regions;

  const where: Prisma.EstimateRequestWhereInput = {
    isDelete: false,
    isDesignated: false,
    status: EstimateStatus.PENDING,
    ...(movingType && { movingType }),
    ...(search && {
      user: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
    }),
    ...(serviceRegionFilter && {
      addresses: {
        some: {
          sido: {
            in: driverRegions, // 핵심: Address.sido ∈ DriverProfile.regions
          },
        },
      },
    }),
  };

  let orderBy = {};
  switch (sort) {
    case 'moving-latest': // 이사 빠른순
      orderBy = { movingDate: 'desc' };
      break;
    case 'moving-oldest': // 이사 느린순
      orderBy = { movingDate: 'asc' };
      break;
    case 'latest': // 요청일 빠른순
    default:
      orderBy = { createdAt: 'desc' };
      break;
    case 'oldest': // 요청일 느린순
      orderBy = { createdAt: 'asc' };
      break;
  }

  const estimateReq = await prisma.estimateRequest.findMany({
    where,
    include: {
      user: { select: { id: true, name: true } },
      addresses: {
        select: {
          addressType: true,
          sido: true,
          sigungu: true,
        },
      },
    },
    orderBy,
    take: finalTake,
    skip: cursor ? 1 : 0,
    ...(cursor && { cursor: { id: cursor } }),
  });

  return estimateReq.map((req) => {
    const from = req.addresses.find((a) => a.addressType === 'FROM');
    const to = req.addresses.find((a) => a.addressType === 'TO');

    return {
      id: req.id,
      name: req.user.name,
      movingType: req.movingType,
      movingDate: req.movingDate,
      from: from ? { sido: from.sido, sigungu: from.sigungu } : null,
      to: to ? { sido: to.sido, sigungu: to.sigungu } : null,
    };
  });
}
