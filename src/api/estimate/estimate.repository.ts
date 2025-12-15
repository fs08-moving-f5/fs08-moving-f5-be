import prisma from '../../config/prisma';
import { EstimateStatus } from '../../generated/client';

export const getPendingEstimatesRepository = async ({ userId }: { userId: string }) => {
  return await prisma.estimate.findMany({
    where: {
      status: EstimateStatus.PENDING,
      isDelete: false,
      estimateRequest: {
        userId,
        isDelete: false,
        status: EstimateStatus.PENDING,
      },
    },
    select: {
      id: true,
      price: true,
      createdAt: true,
      estimateRequest: {
        select: {
          id: true,
          movingType: true,
          movingDate: true,
          isDesignated: true,
          createdAt: true,
          addresses: {
            select: {
              id: true,
              addressType: true,
              sido: true,
              sigungu: true,
            },
          },
        },
      },
      driver: {
        select: {
          id: true,
          driverProfile: {
            select: {
              id: true,
              imageUrl: true,
              career: true,
            },
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              createdAt: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const getUserFavoriteDriversRepository = async ({
  userId,
  driverIds,
}: {
  userId: string;
  driverIds: string[];
}) => {
  return await prisma.favoriteDriver.findMany({
    where: {
      userId,
      driverId: {
        in: driverIds,
      },
    },
    select: {
      driverId: true,
    },
  });
};

// ========== Driver 통계 조회 (여러 driverIds) ==========

/**
 * 여러 driver들의 CONFIRMED 상태 Estimate 개수 조회
 */
export const getConfirmedEstimateCountRepository = async ({
  driverIds,
}: {
  driverIds: string[];
}) => {
  if (driverIds.length === 0) {
    return [];
  }

  return await prisma.estimate.groupBy({
    by: ['driverId'],
    where: {
      driverId: {
        in: driverIds,
      },
      isDelete: false,
      estimateRequest: {
        status: EstimateStatus.CONFIRMED,
        isDelete: false,
      },
    },
    _count: {
      id: true,
    },
  });
};

/**
 * 여러 driver들의 favorite 수 조회
 */
export const getFavoriteDriverCountRepository = async ({ driverIds }: { driverIds: string[] }) => {
  if (driverIds.length === 0) {
    return [];
  }

  return await prisma.favoriteDriver.groupBy({
    by: ['driverId'],
    where: {
      driverId: {
        in: driverIds,
      },
      user: {
        isDelete: false,
      },
    },
    _count: {
      id: true,
    },
  });
};

// ========== Driver 통계 조회 (단일 driverId) ==========

/**
 * 단일 driver의 CONFIRMED 상태 Estimate 개수 조회
 */
export const getConfirmedEstimateCountByDriverIdRepository = async ({
  driverId,
}: {
  driverId: string;
}) => {
  return await prisma.estimate.count({
    where: {
      driverId,
      isDelete: false,
      estimateRequest: {
        status: EstimateStatus.CONFIRMED,
        isDelete: false,
      },
    },
  });
};

/**
 * 단일 driver의 favorite 수 조회
 */
export const getFavoriteDriverCountByDriverIdRepository = async ({
  driverId,
}: {
  driverId: string;
}) => {
  return await prisma.favoriteDriver.count({
    where: {
      driverId,
      user: {
        isDelete: false,
      },
    },
  });
};

export const confirmEstimateRepository = async ({ estimateId }: { estimateId: string }) => {
  return await prisma.estimate.update({
    where: {
      id: estimateId,
    },
    data: {
      status: EstimateStatus.CONFIRMED,
    },
    select: {
      id: true,
      estimateRequestId: true,
      driverId: true,
      price: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const getEstimateDetailRepository = async ({ estimateId }: { estimateId: string }) => {
  return await prisma.estimate.findUnique({
    where: {
      id: estimateId,
    },
    select: {
      id: true,
      price: true,
      status: true,
      estimateRequest: {
        select: {
          id: true,
          movingType: true,
          movingDate: true,
          isDesignated: true,
          addresses: {
            select: {
              id: true,
              addressType: true,
              address: true,
            },
          },
        },
      },
      driver: {
        select: {
          id: true,
          driverProfile: {
            select: {
              id: true,
              imageUrl: true,
              career: true,
              shortIntro: true,
            },
          },
          reviews: {
            select: {
              id: true,
              rating: true,
            },
          },
        },
      },
    },
  });
};

export const getReceivedEstimatesRepository = async ({
  userId,
  status,
}: {
  userId: string;
  status?: EstimateStatus;
}) => {
  return await prisma.estimate.findMany({
    where: {
      isDelete: false,
      estimateRequest: {
        userId,
        isDelete: false,
      },
      ...(status && { status }),
    },
    select: {
      id: true,
      price: true,
      status: true,
      createdAt: true,
      estimateRequest: {
        select: {
          id: true,
          movingType: true,
          movingDate: true,
          isDesignated: true,
          status: true,
          addresses: {
            select: {
              id: true,
              addressType: true,
              address: true,
              sido: true,
              sigungu: true,
            },
          },
        },
      },
      driver: {
        select: {
          id: true,
          driverProfile: {
            select: {
              id: true,
              imageUrl: true,
              career: true,
              shortIntro: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};
