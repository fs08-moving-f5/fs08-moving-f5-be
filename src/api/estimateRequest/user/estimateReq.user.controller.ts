import { Request, Response } from 'express';
import asyncHandler from '@/middlewares/asyncHandler';

import {
  createEstimateRequestService,
  createDesignatedEstimateRequestService,
  getEstimateRequestsInProgressService,
} from './estimateReq.user.service';
import { createEstimateRequestParams } from '@/types/userEstimate';

//진행 중인 견적 조회 (유저)
export const getEstimateRequestsInProgress = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const estimateRequests = await getEstimateRequestsInProgressService({ userId });
  res.status(200).json({ message: '진행 중인 견적 요청 조회 성공', data: estimateRequests });
});

//견적 요청 (유저)
export const createEstimateRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const data: createEstimateRequestParams = {
    userId,
    movingType: req.body.movingType,
    movingDate: new Date(req.body.movingDate),
    from: req.body.from,
    to: req.body.to,
  };

  const estimateReq = await createEstimateRequestService(data);
  res.status(200).json({ message: '견적 요청 성공', data: estimateReq });
});

// 지정 견적 요청 (유저)
export const createDesignatedEstimateRequest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const estimateReq = await createDesignatedEstimateRequestService({
    userId,
    designatedDriverId: req.body.designatedDriverId,
  });
  res.status(200).json({ message: '지정 견적 요청 성공', data: estimateReq });
});
