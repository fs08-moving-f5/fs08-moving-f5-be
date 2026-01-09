import { Request, Response } from 'express';
import { getDriversService } from './driver.service';
import HTTP_STATUS from '@/constants/http.constant';
import { isRegionKey } from './types';
import asyncHandler from '@/middlewares/asyncHandler';

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
