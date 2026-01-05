import prisma from '@/config/prisma';
import { Prisma, UserType } from '@/generated/client';
import {
  GetDriverStatusesRepositoryParams,
  GetFilteredDriverIdsParams,
  GetDriverInfoRepositoryParams,
} from './types';

export const getFilteredDriverIdsRepository = async ({ where, tx }: GetFilteredDriverIdsParams) => {
  const drivers = await (tx ?? prisma).user.findMany({
    where,
    select: {
      id: true,
    },
  });

  return drivers.map((driver) => driver.id);
};

export const getDriverStatusesRepository = async ({
  orderBy,
  cursor,
  limit,
  driverIds,
  tx,
}: GetDriverStatusesRepositoryParams) => {
  return await (tx ?? prisma).driverStatusView.findMany({
    where: driverIds
      ? {
          driverId: {
            in: driverIds,
          },
        }
      : undefined,
    select: {
      driverId: true,
      career: true,
      reviewCount: true,
      averageRating: true,
      confirmedEstimateCount: true,
      favoriteDriverCount: true,
    },
    orderBy: [{ ...orderBy }, { driverId: 'asc' }],
    ...(cursor && { cursor: { driverId: cursor } }),
    take: (limit || 15) + 1,
    skip: cursor ? 1 : 0,
  });
};

export const getDriverInfoRepository = async ({ driverIds, tx }: GetDriverInfoRepositoryParams) => {
  return await (tx ?? prisma).user.findMany({
    where: {
      id: {
        in: driverIds,
      },
      type: UserType.DRIVER,
      isDelete: false,
    },
    select: {
      id: true,
      name: true,
      driverProfile: {
        select: {
          id: true,
          imageUrl: true,
          shortIntro: true,
          description: true,
          regions: true,
          services: true,
        },
      },
    },
  });
};
