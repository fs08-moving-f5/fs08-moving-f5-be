import {
  getPendingEstimatesRepository,
  getUserFavoriteDriversRepository,
  getConfirmedEstimateCountRepository,
  getFavoriteDriverCountRepository,
  confirmEstimateRepository,
  getEstimateDetailRepository,
  getFavoriteDriverCountByDriverIdRepository,
  getConfirmedEstimateCountByDriverIdRepository,
  getReceivedEstimatesRepository,
} from './estimate.repository';
import { EstimateStatus } from '../../generated/client';
import { createNotificationAndPushUnreadService } from '../notification/notification.service';

export const getPendingEstimatesService = async ({ userId }: { userId: string }) => {
  const estimates = await getPendingEstimatesRepository({ userId });

  const driverIds = estimates.map((estimate) => estimate.driver.id);

  const [favoriteDrivers, tasksCounts, favoriteCounts] = await Promise.all([
    getUserFavoriteDriversRepository({ userId, driverIds }),
    getConfirmedEstimateCountRepository({ driverIds }),
    getFavoriteDriverCountRepository({ driverIds }),
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

  return estimates.map((estimate) => ({
    ...estimate,
    isFavorite: favoriteDriverIds.has(estimate.driver.id),
    driver: {
      ...estimate.driver,
      driverProfile: estimate.driver.driverProfile
        ? {
            ...estimate.driver.driverProfile,
            confirmedEstimateCount: tasksCountMap[estimate.driver.id] || 0,
            favoriteDriverCount: favoriteCountMap[estimate.driver.id] || 0,
          }
        : null,
    },
  }));
};

export const confirmEstimateService = async ({ estimateId }: { estimateId: string }) => {
  const estimate = await confirmEstimateRepository({ estimateId });

  if (!estimate) {
    return null;
  }

  await createNotificationAndPushUnreadService({
    userId: estimate.driverId,
    type: 'ESTIMATE_CONFIRMED',
    message: `${estimate.driver.name}님의 견적이 확정되었어요`,
  });

  return estimate;
};

export const getEstimateDetailService = async ({ estimateId }: { estimateId: string }) => {
  const estimate = await getEstimateDetailRepository({ estimateId });

  if (!estimate) {
    return null;
  }

  const [confirmedEstimateCount, favoriteDriverCount] = await Promise.all([
    getConfirmedEstimateCountByDriverIdRepository({ driverId: estimate.driver?.id || '' }),
    getFavoriteDriverCountByDriverIdRepository({ driverId: estimate.driver?.id || '' }),
  ]);

  return {
    ...estimate,
    driver: estimate.driver
      ? {
          ...estimate.driver,
          driverProfile: estimate.driver.driverProfile
            ? {
                ...estimate.driver.driverProfile,
                confirmedEstimateCount,
                favoriteDriverCount,
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

  const [confirmedCounts, favoriteCounts] = await Promise.all([
    getConfirmedEstimateCountRepository({ driverIds }),
    getFavoriteDriverCountRepository({ driverIds }),
  ]);

  const confirmedCountMap = confirmedCounts.reduce<Record<string, number>>((acc, item) => {
    acc[item.driverId] = item._count.id;
    return acc;
  }, {});

  const favoriteCountMap = favoriteCounts.reduce<Record<string, number>>((acc, item) => {
    acc[item.driverId] = item._count.id;
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
          }
        : null,
    },
  }));
};
