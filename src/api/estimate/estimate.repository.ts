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
