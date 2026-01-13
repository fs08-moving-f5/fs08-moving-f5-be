import { Request, Response } from 'express';
import asyncHandler from '@/middlewares/asyncHandler';

import {
  createEstimateRequestService,
  createDesignatedEstimateRequestService,
  getEstimateRequestsInProgressService,
  createEstimateRequestWithGeocodeService,
} from './estimateReq.user.service';
import { createEstimateRequestParams } from '@/types/userEstimate';
import AppError from '@/utils/AppError';
import HTTP_STATUS from '@/constants/http.constant';

//진행 중인 견적 조회 (유저)
export const getEstimateRequestsInProgress = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  if (!userId) {
    throw new AppError('유저 로그인이 필요합니다.', HTTP_STATUS.UNAUTHORIZED);
  }
  const estimateRequests = await getEstimateRequestsInProgressService({ userId });
  res.status(HTTP_STATUS.OK).json({ success: true, data: estimateRequests });
});

//견적 요청 (유저)
export const createEstimateRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  if (!userId) {
    throw new AppError('유저 로그인이 필요합니다.', HTTP_STATUS.UNAUTHORIZED);
  }
  const data: createEstimateRequestParams = {
    userId,
    movingType: req.body.movingType,
    movingDate: new Date(req.body.movingDate),
    from: req.body.from,
    to: req.body.to,
  };
  if (!data.movingType || !data.movingDate || !data.from || !data.to) {
    throw new AppError('필수 데이터가 누락되었습니다.', HTTP_STATUS.BAD_REQUEST);
  }

  const estimateReq = await createEstimateRequestService(data);
  res.status(HTTP_STATUS.OK).json({ success: true, data: estimateReq });
});

// 지정 견적 요청 (유저)
export const createDesignatedEstimateRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  if (!userId) {
    throw new AppError('유저 로그인이 필요합니다.', HTTP_STATUS.UNAUTHORIZED);
  }
  const designatedDriverId = req.body.designatedDriverId;
  if (!designatedDriverId) {
    throw new AppError('지정 기사 정보가 누락되었습니다.', HTTP_STATUS.BAD_REQUEST);
  }
  const estimateReq = await createDesignatedEstimateRequestService({
    userId,
    designatedDriverId,
  });
  res.status(HTTP_STATUS.OK).json({ success: true, data: estimateReq });
});

export const createEstimateRequestWithGeocode = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('유저 로그인이 필요합니다.', HTTP_STATUS.UNAUTHORIZED);
  }

  const { movingType, movingDate, from, to } = req.body;

  if (!movingType || !movingDate || !from || !to) {
    throw new AppError('필수 데이터가 누락되었습니다.', HTTP_STATUS.BAD_REQUEST);
  }

  const estimateReq = await createEstimateRequestWithGeocodeService({
    userId,
    movingType,
    movingDate,
    from,
    to,
  });

  res.status(HTTP_STATUS.CREATED).json({ success: true, data: estimateReq });
});
