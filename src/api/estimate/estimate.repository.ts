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
