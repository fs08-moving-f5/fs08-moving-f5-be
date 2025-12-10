import {
  getPendingEstimatesRepository,
  getUserFavoriteDriversRepository,
  getConfirmedEstimateCountRepository,
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
