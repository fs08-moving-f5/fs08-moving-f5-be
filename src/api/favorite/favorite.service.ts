import HTTP_STATUS from '../../constants/http.constant';
import AppError from '../../utils/AppError';
import {
  createFavoriteDriverRepository,
  deleteFavoriteDriverRepository,
  isFavoriteDriverRepository,
} from './favorite.repository';
import { Prisma } from '../../generated/client';

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
