import HTTP_STATUS from '@/constants/http.constant';
import asyncHandler from '@/middlewares/asyncHandler';
import { Request, Response } from 'express';
import AppError from '@/utils/AppError';
import prisma from '@/config/prisma';

export const getDriverStatusController = asyncHandler(async (req: Request, res: Response) => {
  const driverStatus = await prisma.driverStatusView.findMany({
    take: 10,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: driverStatus,
  });
});
