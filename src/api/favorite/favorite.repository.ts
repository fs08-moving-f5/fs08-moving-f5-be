import prisma from '../../config/prisma';
import { Prisma } from '../../generated/client';

export const isFavoriteDriverRepository = async ({
  userId,
  driverId,
}: {
  userId: string;
  driverId: string;
}) => {
  return await prisma.favoriteDriver.findUnique({
    where: {
      userId_driverId: {
        userId,
        driverId,
      },
    },
    select: {
      id: true,
    },
  });
};

export const createFavoriteDriverRepository = async ({
  userId,
  driverId,
}: {
  userId: string;
  driverId: string;
}) => {
  return await prisma.favoriteDriver.create({
    data: { userId, driverId },
  });
};

export const deleteFavoriteDriverRepository = async ({
  userId,
  driverId,
}: {
  userId: string;
  driverId: string;
}) => {
  return prisma.favoriteDriver.delete({
    where: {
      userId_driverId: {
        userId,
        driverId,
      },
    },
    select: {
      id: true,
    },
  });
};

export const getFavoriteDriversRepository = async ({
  userId,
  cursor,
  limit,
  tx,
}: {
  userId: string;
  cursor: string;
  limit: number;
  tx?: Prisma.TransactionClient;
}) => {
  return await (tx ?? prisma).favoriteDriver.findMany({
    where: {
      userId,
    },
    take: limit + 1,
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: {
      id: true,
      userId: true,
      driverId: true,
      createdAt: true,
      driver: {
        select: {
          id: true,
          name: true,
          reviews: {
            select: {
              id: true,
              rating: true,
            },
          },
          driverProfile: {
            select: {
              id: true,
              imageUrl: true,
              career: true,
              shortIntro: true,
              description: true,
              services: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
    },
  });
};

export const getCountFavoriteDriversRepository = async ({
  userId,
  tx,
}: {
  userId: string;
  tx?: Prisma.TransactionClient;
}) => {
  return await (tx ?? prisma).favoriteDriver.count({
    where: {
      userId,
    },
  });
};

export const deleteManyFavoriteDriverRepository = async ({
  userId,
  driverIds,
}: {
  userId: string;
  driverIds: string[];
}) => {
  return await prisma.favoriteDriver.deleteMany({
    where: {
      AND: [{ userId }, { driverId: { in: driverIds } }],
    },
  });
};
