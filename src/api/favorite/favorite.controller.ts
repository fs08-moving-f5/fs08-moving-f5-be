import HTTP_STATUS from '../../constants/http.constant';
import asyncHandler from '../../middlewares/asyncHandler';
import AppError from '../../utils/AppError';
import { addFavoriteDriverService } from './favorite.service';

export const addFavoriteDriverController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const driverId = req.params.driverId;

  if (!userId || !driverId) {
    throw new AppError('userId 또는 driverId가 필요합니다.', HTTP_STATUS.BAD_REQUEST);
  }

  const favoriteDriver = await addFavoriteDriverService({ userId, driverId });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    data: favoriteDriver,
  });
});
