import prisma from '../../config/prisma';
import { Prisma } from '../../generated/client';
import { ServiceEnum, EstimateStatus } from '../../generated/enums';
import { HttpError } from '../../types/error';
import {
  GetEstimateRequestsParams,
  CreateEstimateParams,
  CreateEstimateRejectParams,
  GetEstimateParams,
} from '../../types/driverEstimate';
import splitAddresses from '../../utils/splitAddresses';

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
    select: {
      id: true,
      movingType: true,
      movingDate: true,
      isDesignated: true,
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
    const { from, to } = splitAddresses(req.addresses);

    return {
      id: req.id,
      name: req.user.name,
      movingType: req.movingType,
      movingDate: req.movingDate,
      isDesignated: req.isDesignated,
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

  const estimate = await prisma.estimate.findMany({
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

  return estimate.map((e) => {
    const { from, to } = splitAddresses(e.estimateRequest.addresses);

    return {
      id: e.id,
      price: e.price,
      status: e.status,
      createdAt: e.createdAt,
      hasReview: !!e.review,

      user: {
        id: e.estimateRequest.user.id,
        name: e.estimateRequest.user.name,
      },

      movingType: e.estimateRequest.movingType,
      movingDate: e.estimateRequest.movingDate,
      isDesignated: e.estimateRequest.isDesignated,

      from: from ? { sido: from.sido, sigungu: from.sigungu } : null,
      to: to ? { sido: to.sido, sigungu: to.sigungu } : null,
    };
  });
}

// 확정 견적 상세 조회
export async function getEstimateConfirmIdRepository(estimateId: string, driverId: string) {
  const estimate = await prisma.estimate.findFirst({
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

  if (!estimate) return null;

  const { from, to } = splitAddresses(estimate.estimateRequest.addresses);

  return {
    id: estimate.id,
    price: estimate.price,

    userName: estimate.estimateRequest.user.name,

    movingType: estimate.estimateRequest.movingType,
    movingDate: estimate.estimateRequest.movingDate,
    isDesignated: estimate.estimateRequest.isDesignated,
    createdAt: estimate.estimateRequest.createdAt,
    updatedAt: estimate.estimateRequest.updatedAt,

    fromAddress: from?.address ?? null,
    toAddress: to?.address ?? null,
  };
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

  const estimate = await prisma.estimate.findMany({
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

  return estimate.map((e) => {
    const { from, to } = splitAddresses(e.estimateRequest.addresses);

    return {
      id: e.id,
      status: e.status,

      estimateRequestId: e.estimateRequest.id,
      movingType: e.estimateRequest.movingType,
      movingDate: e.estimateRequest.movingDate,

      user: {
        id: e.estimateRequest.user.id,
        name: e.estimateRequest.user.name,
      },

      from: from ? { sido: from.sido, sigungu: from.sigungu } : null,
      to: to ? { sido: to.sido, sigungu: to.sigungu } : null,
    };
  });
}
