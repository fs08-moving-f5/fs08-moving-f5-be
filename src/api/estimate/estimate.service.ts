import {
  getPendingEstimatesRepository,
  getUserFavoriteDriversRepository,
  getConfirmedEstimateCountRepository,
  confirmEstimateRepository,
  getEstimateDetailRepository,
  getFavoriteDriverCountByDriverIdRepository,
  getConfirmedEstimateCountByDriverIdRepository,
} from './estimate.repository';

export const getPendingEstimatesService = async ({ userId }: { userId: string }) => {
  const estimates = await getPendingEstimatesRepository({ userId });

  const driverIds = estimates.map((estimate) => estimate.driver.id);

  const [favoriteDrivers, tasksCounts] = await Promise.all([
    getUserFavoriteDriversRepository({ userId, driverIds }),
    getConfirmedEstimateCountRepository({ driverIds }),
  ]);

  const favoriteDriverIds = new Set(favoriteDrivers.map((driver) => driver.driverId));

  const tasksCountMap = tasksCounts.reduce(
    (acc, item) => {
      acc[item.driverId] = item._count.id;
      return acc;
    },
    {} as Record<string, number>,
  );

  return estimates.map((estimate) => ({
    ...estimate,
    isFavorite: favoriteDriverIds.has(estimate.driver.id),
    driver: {
      ...estimate.driver,
      tasksCount: tasksCountMap[estimate.driver.id] || 0,
    },
  }));
};

export const confirmEstimateService = async ({ estimateId }: { estimateId: string }) => {
  return await confirmEstimateRepository({ estimateId });
};

export const getEstimateDetailService = async ({ estimateId }: { estimateId: string }) => {
  // TODO: 확정 건수, 좋아요 누른 유저 수 조회
  const estimate = await getEstimateDetailRepository({ estimateId });

  const [confirmedEstimateCount, favoriteDriverCount] = await Promise.all([
    getConfirmedEstimateCountByDriverIdRepository({ driverId: estimate?.driver?.id || '' }),
    getFavoriteDriverCountByDriverIdRepository({ driverId: estimate?.driver?.id || '' }),
  ]);

  return {
    ...estimate,
    confirmedEstimateCount,
    favoriteDriverCount,
  };
};
