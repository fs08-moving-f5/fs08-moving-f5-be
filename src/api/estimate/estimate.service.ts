import {
  getPendingEstimatesRepository,
  getUserFavoriteDriversRepository,
  getConfirmedEstimateCountRepository,
  getFavoriteDriverCountRepository,
  getDriverReviewAverageRepository,
  confirmEstimateRepository,
  getEstimateDetailRepository,
  getFavoriteDriverCountByDriverIdRepository,
  getConfirmedEstimateCountByDriverIdRepository,
  getDriverReviewAverageByDriverIdRepository,
  getReceivedEstimatesRepository,
  getIsMyFavoriteDriverRepository,
  confirmEstimateRequestRepository,
} from './estimate.repository';
import { EstimateStatus, NotificationType } from '../../generated/client';
import { createNotificationAndPushUnreadService } from '../notification/notification.service';
import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';
import prisma from '@/config/prisma';

// 기존 코드 (Estimate 기준 반환)
// export const getPendingEstimatesService = async ({ userId }: { userId: string }) => {
//   const estimates = await getPendingEstimatesRepository({ userId });

//   const driverIds = estimates.map((estimate) => estimate.driver.id);

//   const [favoriteDrivers, tasksCounts, favoriteCounts] = await Promise.all([
//     getUserFavoriteDriversRepository({ userId, driverIds }),
//     getConfirmedEstimateCountRepository({ driverIds }),
//     getFavoriteDriverCountRepository({ driverIds }),
//   ]);

//   const favoriteDriverIds = new Set(favoriteDrivers.map((driver) => driver.driverId));

//   const tasksCountMap = tasksCounts.reduce<Record<string, number>>((acc, item) => {
//     acc[item.driverId] = item._count.id;
//     return acc;
//   }, {});

//   const favoriteCountMap = favoriteCounts.reduce<Record<string, number>>((acc, item) => {
//     acc[item.driverId] = item._count.id;
//     return acc;
//   }, {});

//   return estimates.map((estimate) => ({
//     ...estimate,
//     isFavorite: favoriteDriverIds.has(estimate.driver.id),
//     driver: {
//       ...estimate.driver,
//       driverProfile: estimate.driver.driverProfile
//         ? {
//             ...estimate.driver.driverProfile,
//             confirmedEstimateCount: tasksCountMap[estimate.driver.id] || 0,
//             favoriteDriverCount: favoriteCountMap[estimate.driver.id] || 0,
//           }
//         : null,
//     },
//   }));
// };

export const getPendingEstimatesService = async ({ userId }: { userId: string }) => {
  const estimateRequests = await getPendingEstimatesRepository({ userId });

  // 모든 estimate의 driver ID 수집
  const driverIds: string[] = [];
  estimateRequests.forEach((request) => {
    request.estimate.forEach((estimate) => {
      if (estimate.driver?.id) {
        driverIds.push(estimate.driver.id);
      }
    });
  });

  const uniqueDriverIds = [...new Set(driverIds)];

  const [favoriteDrivers, tasksCounts, favoriteCounts, reviewAverages] = await Promise.all([
    getUserFavoriteDriversRepository({ userId, driverIds: uniqueDriverIds }),
    getConfirmedEstimateCountRepository({ driverIds: uniqueDriverIds }),
    getFavoriteDriverCountRepository({ driverIds: uniqueDriverIds }),
    getDriverReviewAverageRepository({ driverIds: uniqueDriverIds }),
  ]);

  const favoriteDriverIds = new Set(favoriteDrivers.map((driver) => driver.driverId));

  const tasksCountMap = tasksCounts.reduce<Record<string, number>>((acc, item) => {
    acc[item.driverId] = item._count.id;
    return acc;
  }, {});

  const favoriteCountMap = favoriteCounts.reduce<Record<string, number>>((acc, item) => {
    acc[item.driverId] = item._count.id;
    return acc;
  }, {});

  const reviewAverageMap = reviewAverages.reduce<Record<string, number | null>>((acc, item) => {
    acc[item.driverId] = item.averageRating ? Number(item.averageRating.toFixed(1)) : null;
    return acc;
  }, {});
  return estimateRequests.map((request) => ({
    estimateRequest: {
      id: request.id,
      movingType: request.movingType,
      movingDate: request.movingDate,
      isDesignated: request.isDesignated,
      createdAt: request.createdAt,
      addresses: request.addresses,
    },
    estimates: request.estimate.map((estimate) => ({
      id: estimate.id,
      price: estimate.price,
      status: estimate.status,
      createdAt: estimate.createdAt,
      estimateRequestId: estimate.estimateRequest.id,
      isDesignated: estimate.estimateRequest.isDesignated,
      driver: estimate.driver
        ? {
            id: estimate.driver.id,
            name: estimate.driver.name,
            isFavorite: favoriteDriverIds.has(estimate.driver.id),
            favoriteDriverCount: favoriteCountMap[estimate.driver.id] || 0,
            driverProfile: estimate.driver.driverProfile
              ? {
                  ...estimate.driver.driverProfile,
                  confirmedEstimateCount: tasksCountMap[estimate.driver.id] || 0,
                  favoriteDriverCount: favoriteCountMap[estimate.driver.id] || 0,
                  averageRating: reviewAverageMap[estimate.driver.id] ?? null,
                }
              : null,
          }
        : null,
    })),
  }));
};

// export const confirmEstimateService = async ({ estimateId }: { estimateId: string }) => {
//   const estimate = await confirmEstimateRepository({ estimateId });

//   if (!estimate) {
//     return null;
//   }
//   await createNotificationAndPushUnreadService({
//     userId: estimate.driverId,
//     type: 'ESTIMATE_CONFIRMED',
//     message: `${estimate.driver.name}님의 견적이 확정되었어요`,
//   });

//   return estimate;
// };

export const confirmEstimateService = async ({ estimateId }: { estimateId: string }) => {
  return await prisma.$transaction(async (tx) => {
    const estimate = await confirmEstimateRepository({ estimateId, tx });

    if (!estimate) {
      return null;
    }

    await confirmEstimateRequestRepository({
      estimateRequestId: estimate.estimateRequestId,
      userId: estimate.driverId,
      tx,
    });

    await createNotificationAndPushUnreadService({
      userId: estimate.driverId,
      type: NotificationType.ESTIMATE_CONFIRMED,
      message: `${estimate.driver.name}님의 견적이 확정되었어요`,
      tx,
    });

    return estimate;
  });
};

export const getEstimateDetailService = async ({
  estimateId,
  userId,
}: {
  estimateId: string;
  userId: string;
}) => {
  if (!userId) {
    throw new AppError('유저 ID가 필요합니다.', HTTP_STATUS.BAD_REQUEST);
  }

  const estimate = await getEstimateDetailRepository({ estimateId });

  if (!estimate) {
    return null;
  }

  const driverId = estimate.driver?.id;

  if (!driverId) {
    throw new AppError('기사 ID가 필요합니다.', HTTP_STATUS.BAD_REQUEST);
  }

  const isMyFavoriteDriver = await getIsMyFavoriteDriverRepository({ userId, driverId });

  const [confirmedEstimateCount, favoriteDriverCount, averageRatingRaw] = await Promise.all([
    getConfirmedEstimateCountByDriverIdRepository({ driverId: estimate.driver?.id || '' }),
    getFavoriteDriverCountByDriverIdRepository({ driverId: estimate.driver?.id || '' }),
    getDriverReviewAverageByDriverIdRepository({ driverId: estimate.driver?.id || '' }),
  ]);

  const averageRating = averageRatingRaw ? Number(averageRatingRaw.toFixed(1)) : null;

  return {
    ...estimate,
    driver: estimate.driver
      ? {
          ...estimate.driver,
          isFavorite: isMyFavoriteDriver ? true : false,
          driverProfile: estimate.driver.driverProfile
            ? {
                ...estimate.driver.driverProfile,
                confirmedEstimateCount,
                favoriteDriverCount,
                averageRating,
              }
            : null,
        }
      : null,
  };
};

export const getReceivedEstimatesService = async ({
  userId,
  status,
}: {
  userId: string;
  status?: EstimateStatus;
}) => {
  const receivedEstimates = await getReceivedEstimatesRepository({
    userId,
    status,
  });

  if (receivedEstimates.length === 0) {
    return [];
  }

  const driverIds = receivedEstimates.map((estimate) => estimate.driver.id);

  const [confirmedCounts, favoriteCounts, reviewAverages] = await Promise.all([
    getConfirmedEstimateCountRepository({ driverIds }),
    getFavoriteDriverCountRepository({ driverIds }),
    getDriverReviewAverageRepository({ driverIds }),
  ]);

  const confirmedCountMap = confirmedCounts.reduce<Record<string, number>>((acc, item) => {
    acc[item.driverId] = item._count.id;
    return acc;
  }, {});

  const favoriteCountMap = favoriteCounts.reduce<Record<string, number>>((acc, item) => {
    acc[item.driverId] = item._count.id;
    return acc;
  }, {});

  const reviewAverageMap = reviewAverages.reduce<Record<string, number | null>>((acc, item) => {
    acc[item.driverId] = item.averageRating ? Number(item.averageRating.toFixed(1)) : null;
    return acc;
  }, {});
  return receivedEstimates.map((estimate) => ({
    ...estimate,
    driver: {
      ...estimate.driver,
      driverProfile: estimate.driver.driverProfile
        ? {
            ...estimate.driver.driverProfile,
            confirmedEstimateCount: confirmedCountMap[estimate.driver.id] || 0,
            favoriteDriverCount: favoriteCountMap[estimate.driver.id] || 0,
            averageRating: reviewAverageMap[estimate.driver.id] ?? null,
          }
        : null,
    },
  }));
};
