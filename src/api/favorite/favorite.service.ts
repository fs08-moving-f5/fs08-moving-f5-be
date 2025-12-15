import HTTP_STATUS from '../../constants/http.constant';
import AppError from '../../utils/AppError';
import { createFavoriteDriverRepository, isFavoriteDriverRepository } from './favorite.repository';

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
