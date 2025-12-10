import {
  getPendingEstimatesRepository,
  getUserFavoriteDriversRepository,
} from './estimate.repository';

export const getPendingEstimatesService = async ({ userId }: { userId: string }) => {
  const estimates = await getPendingEstimatesRepository({ userId });

  const driverIds = estimates.map((estimate) => estimate.driver.id);

  const favoriteDrivers = await getUserFavoriteDriversRepository({ userId, driverIds });

  const favoriteDriverIds = new Set(favoriteDrivers.map((driver) => driver.driverId));

  const isFavoriteDriver = (driverId: string) => favoriteDriverIds.has(driverId);

  return estimates.map((estimate) => ({
    ...estimate,
    isFavorite: isFavoriteDriver(estimate.driver.id),
  }));
};
