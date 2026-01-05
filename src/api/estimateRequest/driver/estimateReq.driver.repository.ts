import prisma from '@/config/prisma';
import { Prisma } from '@/generated/client';
import { EstimateStatus, HistoryActionType, HistoryEntityType } from '@/generated/enums';
import {
  GetEstimateRequestsParams,
  CreateEstimateParams,
  CreateEstimateRejectParams,
  GetEstimateParams,
} from '@/types/driverEstimate';

const DEFAULT_TAKE = 6;

// 받은 요청 목록 조회(기사)
export async function getEstimateRequestsRepository({
  driverId,
  movingType,
  isDesignated = false,
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
            in: driverProfile.regions, // 핵심: Address.sido ∈ DriverProfile.regions
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

  return await prisma.estimateRequest.findMany({
    where,
    select: {
      id: true,
      movingType: true,
      movingDate: true,
      isDesignated: true,
      createdAt: true,
      updatedAt: true,
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
}

// 기존 견적 존재 여부
export const findExistingEstimateRepository = async ({
  estimateRequestId,
  driverId,
}: {
  estimateRequestId: string;
  driverId: string;
}) => {
  return await prisma.estimate.findUnique({
    where: {
      estimateRequestId_driverId: {
        estimateRequestId,
        driverId,
      },
    },
  });
};

// 견적 보내기 (기사)
export async function createEstimateRepository({
  estimateRequestId,
  price,
  comment,
  driverId,
  tx,
}: CreateEstimateParams) {
  return await (tx ?? prisma).estimate.create({
    data: {
      estimateRequestId,
      driverId,
      price,
      comment,
      status: EstimateStatus.PENDING,
    },
    include: {
      estimateRequest: true,
      driver: true,
    },
  });
}

// 견적 반려 (기사)
export async function createEstimateRejectRepository({
  estimateRequestId,
  rejectReason,
  driverId,
  tx,
}: CreateEstimateRejectParams) {
  return await (tx ?? prisma).estimate.create({
    data: {
      estimateRequestId,
      driverId,
      rejectReason,
      status: EstimateStatus.REJECTED,
    },
    include: {
      estimateRequest: true,
      driver: true,
    },
  });
}

// 리뷰 테이블 생성
export const createReviewRepository = async ({
  estimateId,
  userId,
  tx,
}: {
  estimateId: string;
  userId: string;
  tx?: Prisma.TransactionClient;
}) => {
  return await (tx ?? prisma).review.create({
    data: {
      estimateId,
      userId,
      rating: null,
      content: null,
    },
  });
};

// 히스토리 생성
export const createHistoryRepository = async ({
  userId,
  entityId,
  tx,
}: {
  userId: string;
  entityId: string;
  actionType: string;
  tx?: Prisma.TransactionClient;
}) => {
  return await (tx ?? prisma).history.create({
    data: {
      userId,
      entityType: HistoryEntityType.ESTIMATE_RESPONSE,
      entityId,
      actionType: HistoryActionType.CREATE_ESTIMATE,
    },
  });
};

// 확정 견적 목록 조회
export async function getEstimateConfirmRepository({
  driverId,
  sort = 'latest',
  cursor,
  take = DEFAULT_TAKE,
}: GetEstimateParams) {
  // take를 숫자로 변환
  const parsedTake = typeof take === 'string' ? parseInt(take, 10) : take;
  const finalTake = isNaN(parsedTake) ? DEFAULT_TAKE : parsedTake;

  const where: Prisma.EstimateWhereInput = {
    driverId,
    isDelete: false,
    status: {
      in: [EstimateStatus.PENDING, EstimateStatus.CONFIRMED],
    },
  };

  let orderBy = {};
  switch (sort) {
    case 'latest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  return await prisma.estimate.findMany({
    where,
    select: {
      id: true,
      price: true,
      status: true,
      createdAt: true,

      review: { select: { id: true } },

      estimateRequest: {
        select: {
          movingType: true,
          movingDate: true,
          status: true,
          isDesignated: true,

          user: {
            select: {
              id: true,
              name: true,
            },
          },

          addresses: {
            select: {
              addressType: true,
              sido: true,
              sigungu: true,
            },
          },
        },
      },
    },
    orderBy,
    take: finalTake,
    skip: cursor ? 1 : 0,
    ...(cursor && { cursor: { id: cursor } }),
  });
}

// 확정 견적 상세 조회
export async function getEstimateConfirmIdRepository(estimateId: string, driverId: string) {
  return await prisma.estimate.findFirst({
    where: { id: estimateId, driverId, isDelete: false },
    select: {
      id: true,
      price: true,

      estimateRequest: {
        select: {
          movingType: true,
          movingDate: true,
          isDesignated: true,
          createdAt: true,
          updatedAt: true,

          user: { select: { id: true, name: true } },

          addresses: { select: { addressType: true, address: true } },
        },
      },
    },
  });
}

// 반려 견적 목록 조회
export async function getEstimateRejectRepository({
  driverId,
  sort = 'latest',
  cursor,
  take = DEFAULT_TAKE,
}: GetEstimateParams) {
  // take를 숫자로 변환
  const parsedTake = typeof take === 'string' ? parseInt(take, 10) : take;
  const finalTake = isNaN(parsedTake) ? DEFAULT_TAKE : parsedTake;

  const where: Prisma.EstimateWhereInput = {
    driverId,
    isDelete: false,
    status: EstimateStatus.REJECTED,
  };

  let orderBy = {};
  switch (sort) {
    case 'latest':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  return await prisma.estimate.findMany({
    where,
    orderBy,
    take: finalTake,
    skip: cursor ? 1 : 0,
    ...(cursor && { cursor: { id: cursor } }),

    select: {
      id: true,
      status: true,

      estimateRequest: {
        select: {
          id: true,
          movingType: true,
          movingDate: true,

          user: { select: { id: true, name: true } },

          addresses: {
            select: {
              addressType: true,
              sido: true,
              sigungu: true,
            },
          },
        },
      },
    },
  });
}
