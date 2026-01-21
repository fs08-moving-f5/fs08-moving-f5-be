import HTTP_STATUS from '../../constants/http.constant';
import AppError from '../../utils/AppError';
import {
  createFavoriteDriverRepository,
  deleteFavoriteDriverRepository,
  deleteManyFavoriteDriverRepository,
  getCountFavoriteDriversRepository,
  getFavoriteDriversRepository,
  isFavoriteDriverRepository,
} from './favorite.repository';
import { Prisma } from '../../generated/client';
import { getDriverStatusesByDriverIdsRepository } from '../estimate/estimate.repository';
import { invalidateDriverDetailCache } from '@/cache/invalidate';
import { bumpDriverListCacheVersion } from '@/cache/invalidate';
import prisma from '@/config/prisma';

export const addFavoriteDriverService = async ({
  userId,
  driverId,
}: {
  userId: string;
  driverId: string;
}) => {
  return await prisma.$transaction(async (tx) => {
    const isFavorite = await isFavoriteDriverRepository({ userId, driverId });

    if (isFavorite) {
      throw new AppError('이미 찜한 기사입니다.', HTTP_STATUS.CONFLICT);
    }

    const favorite = await createFavoriteDriverRepository({ userId, driverId });

    // 캐시 무효화
    await invalidateDriverDetailCache(driverId);
    await bumpDriverListCacheVersion();

    return favorite;
  });
};

export const deleteFavoriteDriverService = async ({
  userId,
  driverId,
}: {
  userId: string;
  driverId: string;
}) => {
  return await prisma.$transaction(async (tx) => {
    try {
      const result = await deleteFavoriteDriverRepository({ userId, driverId });

      // 실제로 삭제된 경우만 캐시 무효화
      if (result) {
        await invalidateDriverDetailCache(driverId);
        await bumpDriverListCacheVersion();
      }

      return { removed: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return { removed: false };
        }
      }
      throw error;
    }
  });
};

export const getFavoriteDriversService = async ({
  userId,
  cursor,
  limit,
}: {
  userId: string;
  cursor: string;
  limit: number;
}) => {
  return await prisma.$transaction(async (tx) => {
    const [favoriteDrivers, count] = await Promise.all([
      getFavoriteDriversRepository({ userId, cursor, limit, tx }),
      getCountFavoriteDriversRepository({ userId, tx }),
    ]);

    if (favoriteDrivers.length === 0) {
      return {
        data: [],
        count,
        pagination: {
          hasNext: false,
          nextCursor: null,
        },
      };
    }

    const driverIds = favoriteDrivers.map((driver) => driver.driverId);

    const driverStatuses = await getDriverStatusesByDriverIdsRepository({ driverIds, tx });

    const driverStatusMap = driverStatuses.reduce<
      Record<
        string,
        {
          confirmedEstimateCount: number;
          favoriteDriverCount: number;
          averageRating: number | null;
          reviewCount: number;
        }
      >
    >((acc, item) => {
      acc[item.driverId] = {
        confirmedEstimateCount: item.confirmedEstimateCount,
        favoriteDriverCount: item.favoriteDriverCount,
        averageRating: item.averageRating || null,
        reviewCount: item.reviewCount,
      };
      return acc;
    }, {});

    const hasNext = favoriteDrivers.length > limit;
    const slicedDrivers = hasNext ? favoriteDrivers.slice(0, limit) : favoriteDrivers;

    const data = slicedDrivers.map((favoriteDriver) => {
      const driverStatus = driverStatusMap[favoriteDriver.driverId] || {
        confirmedEstimateCount: 0,
        favoriteDriverCount: 0,
        averageRating: null,
        reviewCount: 0,
      };

      return {
        ...favoriteDriver,
        driver: {
          ...favoriteDriver.driver,
          driverProfile: favoriteDriver.driver.driverProfile
            ? {
                ...favoriteDriver.driver.driverProfile,
                confirmedEstimateCount: driverStatus.confirmedEstimateCount,
                favoriteDriverCount: driverStatus.favoriteDriverCount,
                averageRating: driverStatus.averageRating,
                reviewCount: driverStatus.reviewCount,
              }
            : null,
        },
      };
    });

    const nextCursor = hasNext ? slicedDrivers[slicedDrivers.length - 1].id : null;

    const pagination = {
      hasNext,
      nextCursor,
    };

    return {
      data,
      count,
      pagination,
    };
  });
};

export const deleteManyFavoriteDriverService = async ({
  userId,
  driverIds,
}: {
  userId: string;
  driverIds: string[];
}) => {
  return await prisma.$transaction(async (tx) => {
    try {
      const result = await deleteManyFavoriteDriverRepository({ userId, driverIds });

      if (result.count > 0) {
        // 삭제된 기사들만 상세 캐시 무효화
        await Promise.all(driverIds.map((driverId) => invalidateDriverDetailCache(driverId)));

        // 리스트 캐시 무효화
        await bumpDriverListCacheVersion();
      }

      return { removed: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2022') {
          return { removed: false };
        }
      }
      throw error;
    }
  });
};
