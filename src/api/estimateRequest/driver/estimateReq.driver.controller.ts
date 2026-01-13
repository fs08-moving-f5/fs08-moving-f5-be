import { Request, Response } from 'express';
import * as service from './estimateReq.driver.service';
import * as validator from './validators/estimateReq.driver.validators';
import asyncHandler from '@/middlewares/asyncHandler';
import HTTP_STATUS from '@/constants/http.constant';
import type {
  GetEstimateRequestsParams,
  CreateEstimateParams,
  CreateEstimateRejectParams,
  GetEstimateParams,
} from '@/types/driverEstimate';

// 받은 요청 목록 조회(기사)
export const getEstimateRequests = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user!.id;

  const query = validator.getEstimateRequestsSchema.parse(req.query);

  const params: GetEstimateRequestsParams = {
    driverId,
    search: query.search,
    sort: query.sort,
    cursor: query.cursor ?? undefined,
    take: query.take,
  };

  const estimates = await service.getEstimateRequestsService(params);

  res.status(HTTP_STATUS.OK).json({ success: true, data: estimates });
});

// 견적 보내기(기사)
export const createEstimate = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user!.id;
  const query = validator.createEstimateSchema.parse({
    params: req.params,
    body: req.body,
  });

  const data: CreateEstimateParams = {
    driverId,
    estimateRequestId: query.params.estimateRequestId,
    price: query.body.price,
    comment: query.body.comment,
  };

  const estimate = await service.createEstimateService(data);

  res.status(HTTP_STATUS.OK).json({ success: true, data: estimate });
});

// 견적 반려(기사)
export const createEstimateReject = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user!.id;
  const query = validator.createEstimateRejectSchema.parse({
    params: req.params,
    body: req.body,
  });

  const data: CreateEstimateRejectParams = {
    driverId,
    estimateRequestId: query.params.estimateRequestId,
    rejectReason: query.body.rejectReason,
  };

  const estimate = await service.createEstimateRejectService(data);

  res.status(HTTP_STATUS.OK).json({ success: true, data: estimate });
});

// 확정 견적 목록 조회
export const getEstimateConfirm = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user!.id;

  const query = validator.getEstimateListSchema.parse(req.query);

  const data: GetEstimateParams = {
    driverId,
    sort: query.sort,
    cursor: query.cursor ?? undefined,
    take: query.take,
  };

  const estimateConfirm = await service.getEstimateConfirmService(data);

  res.status(HTTP_STATUS.OK).json({ success: true, data: estimateConfirm });
});

// 확정 견적 상세 조회
export const getEstimateConfirmId = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user!.id;
  const { estimateId } = validator.getConfirmedEstimateDetailSchema.parse(req.query);

  const estimate = await service.getEstimateConfirmIdService(estimateId, driverId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: estimate,
  });
});

// 반려 견적 목록 조회
export const getEstimateReject = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user!.id;

  const query = validator.getEstimateListSchema.parse(req.query);

  const data: GetEstimateParams = {
    driverId,
    sort: query.sort,
    cursor: query.cursor ?? undefined,
    take: query.take,
  };

  const estimateReject = await service.getEstimateRejectService(data);

  res.status(HTTP_STATUS.OK).json({ success: true, data: estimateReject });
});
