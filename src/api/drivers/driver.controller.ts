import { Request, Response } from 'express';
import {
  getDriversService,
  getNearbyEstimateRequestsService,
  updateDriverOfficeService,
} from './driver.service';
import HTTP_STATUS from '@/constants/http.constant';
import { isRegionKey } from './types';
import asyncHandler from '@/middlewares/asyncHandler';
import AppError from '@/utils/AppError';

export const getDriversController = asyncHandler(async (req: Request, res: Response) => {
  const { region, service, sort, cursor, limit, search } = req.query;
  const userId = req.user?.id;

  const regionValue = region ? String(region) : undefined;
  const validRegion = regionValue && isRegionKey(regionValue) ? regionValue : undefined;

  const result = await getDriversService({
    userId,
    region: validRegion,
    service: service ? String(service) : undefined,
    sort: sort ? String(sort) : undefined,
    cursor: cursor ? String(cursor) : undefined,
    limit: limit ? Number(limit) : undefined,
    search: search ? String(search) : undefined,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
});

export const updateDriverOfficeController = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user?.id;
  if (!driverId) {
    throw new AppError('인증이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
  }

  const result = await updateDriverOfficeService({ driverId, body: req.body });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});

export const getNearbyRequestsController = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user?.id;

  if (!driverId) {
    throw new AppError('인증이 필요합니다', HTTP_STATUS.UNAUTHORIZED);
  }

  const radiusKm = Number(req.query.radiusKm ?? 20);

  if (!Number.isFinite(radiusKm) || radiusKm < 0 || radiusKm > 200) {
    throw new AppError('유효하지 않은 반경입니다', HTTP_STATUS.BAD_REQUEST);
  }

  const result = await getNearbyEstimateRequestsService({ driverId, radiusKm });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: result,
  });
});
