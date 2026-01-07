import {
  getDriverInfoRepository,
  getDriverStatusesRepository,
  getFilteredDriverIdsRepository,
} from './driver.repository';
import { getUserFavoriteDriversRepository } from '../estimate/estimate.repository';
import prisma from '@/config/prisma';
import { GetDriversServiceParams, regionMap } from './types';
import { Prisma, RegionEnum, ServiceEnum, UserType } from '@/generated/client';

export const getDriversService = async ({
  userId,
  region,
  service,
  sort,
  cursor,
  limit = 15,
  search,
}: GetDriversServiceParams) => {
  return await prisma.$transaction(async (tx) => {
    let orderBy = {};
    switch (sort) {
      case 'review':
        orderBy = { reviewCount: 'desc' };
        break;
      case 'rating':
        orderBy = { averageRating: 'desc' };
        break;
      case 'career':
        orderBy = { career: 'desc' };
        break;
      case 'confirmed-estimate':
        orderBy = { confirmedEstimateCount: 'desc' };
        break;
    }

    const regionValue = region ? (regionMap[region] as RegionEnum) : undefined;
    const serviceValue = service ? (service as ServiceEnum) : undefined;

    const hasFilter =
      regionValue !== undefined || serviceValue !== undefined || search !== undefined;

    const filteredDriverIds = hasFilter
      ? await getFilteredDriverIdsRepository({
          where: {
            type: UserType.DRIVER,
            isDelete: false,
            ...(search && {
              name: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            }),
            driverProfile: {
              ...(regionValue && {
                regions: {
                  has: regionValue,
                },
              }),
              ...(serviceValue && {
                services: {
                  has: serviceValue,
                },
              }),
            },
          },
          tx,
        })
      : undefined;

    if (filteredDriverIds && filteredDriverIds.length === 0) {
      return {
        data: [],
        pagination: {
          hasNext: false,
          nextCursor: null,
        },
      };
    }

    const driverStatuses = await getDriverStatusesRepository({
      orderBy,
      cursor,
      limit,
      driverIds: filteredDriverIds,
      tx,
    });

    if (driverStatuses.length === 0) {
      return {
        data: [],
        pagination: {
          hasNext: false,
          nextCursor: null,
        },
      };
    }

    const hasNext = driverStatuses.length > limit;
    const slicedDriverStatuses = hasNext ? driverStatuses.slice(0, limit) : driverStatuses;

    const driverIds = slicedDriverStatuses.map((driverStatus) => driverStatus.driverId);
    const uniqueDriverIds = [...new Set(driverIds)];

    const driverInfo = await getDriverInfoRepository({
      driverIds: uniqueDriverIds,
      tx,
    });

    const favoriteDrivers = userId
      ? await getUserFavoriteDriversRepository({
          userId,
          driverIds: uniqueDriverIds,
          tx,
        })
      : [];

    const favoriteDriverIds = new Set(favoriteDrivers.map((driver) => driver.driverId));

    const driverInfoMap = new Map(driverInfo.map((driver) => [driver.id, driver]));

    const data = slicedDriverStatuses
      .map((driverStatus) => {
        const driver = driverInfoMap.get(driverStatus.driverId);
        if (!driver) {
          return null;
        }

        return {
          id: driver.id,
          name: driver.name,
          driverProfile: driver.driverProfile
            ? {
                id: driver.driverProfile.id,
                imageUrl: driver.driverProfile.imageUrl,
                shortIntro: driver.driverProfile.shortIntro,
                description: driver.driverProfile.description,
                regions: driver.driverProfile.regions,
                services: driver.driverProfile.services,
              }
            : null,
          career: driverStatus.career,
          favoriteDriverCount: driverStatus.favoriteDriverCount,
          confirmedEstimateCount: driverStatus.confirmedEstimateCount,
          averageRating: driverStatus.averageRating,
          reviewCount: driverStatus.reviewCount,
          isFavorite: favoriteDriverIds.has(driverStatus.driverId),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    const nextCursor = hasNext
      ? slicedDriverStatuses[slicedDriverStatuses.length - 1].driverId
      : null;

    return {
      data,
      pagination: {
        hasNext,
        nextCursor,
      },
    };
  });
};
