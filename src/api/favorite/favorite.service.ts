import HTTP_STATUS from '../../constants/http.constant';
import AppError from '../../utils/AppError';
import {
  createFavoriteDriverRepository,
  deleteFavoriteDriverRepository,
  getFavoriteDriversRepository,
  isFavoriteDriverRepository,
} from './favorite.repository';
import { Prisma } from '../../generated/client';
import {
  getConfirmedEstimateCountRepository,
  getFavoriteDriverCountRepository,
} from '../estimate/estimate.repository';

export const addFavoriteDriverService = async ({
  userId,
  driverId,
}: {
  userId: string;
  driverId: string;
}) => {
  const isFavorite = await isFavoriteDriverRepository({ userId, driverId });

  if (isFavorite) {
    throw new AppError('이미 찜한 기사입니다.', HTTP_STATUS.CONFLICT);
  }

  return await createFavoriteDriverRepository({ userId, driverId });
};

export const deleteFavoriteDriverService = async ({
  userId,
  driverId,
}: {
  userId: string;
  driverId: string;
}) => {
  try {
    await deleteFavoriteDriverRepository({ userId, driverId });
    return { removed: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return { removed: false };
      }
    }
    throw error;
  }
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
  const favoriteDrivers = await getFavoriteDriversRepository({ userId, cursor, limit });

  if (favoriteDrivers.length === 0) {
    return {
      data: [],
      pagination: {
        hasNext: false,
        nextCursor: null,
      },
    };
  }

  const driverIds = favoriteDrivers.map((driver) => driver.driverId);

  const [tasksCounts, favoriteCounts] = await Promise.all([
    getConfirmedEstimateCountRepository({ driverIds }),
    getFavoriteDriverCountRepository({ driverIds }),
  ]);

  const tasksCountMap = tasksCounts.reduce<Record<string, number>>((acc, item) => {
    acc[item.driverId] = item._count.id;
    return acc;
  }, {});

  const favoriteCountMap = favoriteCounts.reduce<Record<string, number>>((acc, item) => {
    acc[item.driverId] = item._count.id;
    return acc;
  }, {});

  const hasNext = favoriteDrivers.length > limit;
  const slicedDrivers = hasNext ? favoriteDrivers.slice(0, limit) : favoriteDrivers;

  const data = slicedDrivers.map((favoriteDriver) => {
    const tasksCount = tasksCountMap[favoriteDriver.driverId] || 0;
    const favoriteCount = favoriteCountMap[favoriteDriver.driverId] || 0;

    return {
      ...favoriteDriver,
      driver: {
        ...favoriteDriver.driver,
        driverProfile: favoriteDriver.driver.driverProfile.map((profile) => ({
          ...profile,
          tasksCount,
          favoriteCount,
        })),
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
    pagination,
  };
};
