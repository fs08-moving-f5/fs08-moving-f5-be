import prisma from '../../config/prisma';
import { Prisma } from '../../generated/client';
import { ServiceEnum, EstimateStatus } from '../../generated/enums';
import { HttpError } from '../../types/error';
import {
  GetEstimateRequestsParams,
  CreateEstimateParams,
  CreateEstimateRejectParams,
} from '../../types/driverEstimate';

const DEFAULT_TAKE = 6;

// 받은 요청 목록 조회(기사)
export async function getEstimateRequestsRepository({
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

// 견적 보내기 (기사)
export async function createEstimateRepository({
  estimateRequestId,
  price,
  comment,
  driverId,
}: CreateEstimateParams) {
  if (!estimateRequestId) {
    throw new HttpError('estimateRequestId가 필요합니다.', 400);
  }

  const existingEstimate = await prisma.estimate.findUnique({
    where: {
      estimateRequestId_driverId: {
        estimateRequestId,
        driverId,
      },
    },
  });

  if (existingEstimate) {
    throw new HttpError('이미 해당 요청에 견적을 제출했습니다.', 400);
  }

  return prisma.estimate.create({
    data: {
      estimateRequestId,
      driverId,
      price,
      comment,
      status: EstimateStatus.PENDING,
    },
    include: { estimateRequest: true, driver: true },
  });
}

// 견적 반려 (기사)
export async function createEstimateRejectRepository({
  estimateRequestId,
  rejectReason,
  driverId,
}: CreateEstimateRejectParams) {
  if (!estimateRequestId) {
    throw new HttpError('estimateRequestId가 필요합니다.', 400);
  }

  const existingEstimate = await prisma.estimate.findUnique({
    where: {
      estimateRequestId_driverId: {
        estimateRequestId,
        driverId,
      },
    },
  });

  if (existingEstimate) {
    throw new HttpError('이미 해당 요청에 견적을 제출했습니다.', 400);
  }

  return prisma.estimate.create({
    data: {
      estimateRequestId,
      driverId,
      rejectReason,
      status: EstimateStatus.PENDING,
    },
    include: { estimateRequest: true, driver: true },
  });
}

// 확정 견적 목록 조회
// export async function getEstimateConfirmRepository({ driverId, cursor, take = DEFAULT_TAKE }) {
//   // take를 숫자로 변환
//   const parsedTake = typeof take === 'string' ? parseInt(take, 10) : take;
//   const finalTake = isNaN(parsedTake) ? DEFAULT_TAKE : parsedTake;

//   const where: Prisma.EstimateWhereInput = {
//     status: EstimateStatus.CONFIRMED || EstimateStatus.PENDING,
//   };
// }

// 확정 견적 상세 조회
export async function getEstimateIdRepository({}) {}

// 반려 견적 목록 조회
export async function getEstimateRejectRepository([]) {}
