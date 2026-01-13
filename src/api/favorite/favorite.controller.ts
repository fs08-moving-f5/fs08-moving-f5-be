import HTTP_STATUS from '../../constants/http.constant';
import asyncHandler from '../../middlewares/asyncHandler';
import AppError from '../../utils/AppError';
import {
  addFavoriteDriverService,
  deleteFavoriteDriverService,
  deleteManyFavoriteDriverService,
  getFavoriteDriversService,
} from './favorite.service';
import { Request, Response } from 'express';

interface QueryParams {
  cursor?: string;
  limit?: number;
}

export const addFavoriteDriverController = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
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

export const deleteFavoriteDriverController = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const driverId = req.params.driverId;

  if (!userId || !driverId) {
    throw new AppError('userId 또는 driverId가 필요합니다.', HTTP_STATUS.BAD_REQUEST);
  }

  const result = await deleteFavoriteDriverService({ userId, driverId });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

export const getFavoriteDriversController = asyncHandler(
  async (req: Request<{}, {}, {}, QueryParams>, res: Response) => {
    const userId = req.user!.id;
    const { cursor, limit } = req.query;

    if (!userId) {
      throw new AppError('userId가 필요합니다.', HTTP_STATUS.BAD_REQUEST);
    }

    const cursorValue = cursor ? String(cursor) : '';
    const limitValue = limit ? Number(limit) : 10;

    const { data, pagination } = await getFavoriteDriversService({
      userId,
      cursor: cursorValue,
      limit: limitValue,
    });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data,
      pagination,
    });
  },
);

export const deleteManyFavoriteDriverController = asyncHandler(
  async (req: Request<{}, {}, string[], {}>, res) => {
    const userId = req.user!.id;
    const driverIds = req.body;

    if (!userId) {
      throw new AppError('userId가 필요합니다.', HTTP_STATUS.BAD_REQUEST);
    }

    const result = await deleteManyFavoriteDriverService({ userId, driverIds });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  },
);
