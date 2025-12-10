// mockFavoriteDriver.ts
import { v4 as uuid } from 'uuid';
import { FavoriteDriver } from './dataType';

/**
 * @param userIds - USER 타입 ID 배열
 * @param driverIds - DRIVER 타입 ID 배열
 */
const mockFavoriteDrivers = (userIds: string[], driverIds: string[]): FavoriteDriver[] => {
  const favorites: FavoriteDriver[] = [];

  userIds.forEach((userId) => {
    const shuffledDrivers = [...driverIds].sort(() => 0.5 - Math.random());

    shuffledDrivers.forEach((driverId) => {
      favorites.push({
        id: uuid(),
        userId,
        driverId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  });

  return favorites;
};

export default mockFavoriteDrivers;
