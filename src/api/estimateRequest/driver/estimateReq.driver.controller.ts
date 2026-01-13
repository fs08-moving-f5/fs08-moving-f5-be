import { Request, Response } from 'express';
import * as service from './estimateReq.driver.service';
import * as validator from './validators/estimateReq.driver.validators';
import asyncHandler from '@/middlewares/asyncHandler';
import HTTP_STATUS from '@/constants/http.constant';
import { ServiceEnum, EstimateStatus } from '@/generated/enums';
import type {
  GetEstimateRequestsParams,
  CreateEstimateParams,
  CreateEstimateRejectParams,
  EstimateSort,
  GetEstimateParams,
} from '@/types/driverEstimate';

// 받은 요청 목록 조회(기사)
export const getEstimateRequests = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user!.id;

  const movingTypes =
    typeof req.query.movingTypes === 'string'
      ? (req.query.movingTypes.split(',') as ServiceEnum[])
      : (req.query.movingTypes as ServiceEnum[] | undefined);

  const params: GetEstimateRequestsParams = {
    driverId,
    movingTypes,
    isDesignated: req.query.isDesignated === 'true',
    serviceRegionFilter: req.query.serviceRegionFilter === 'true',
    search: req.query.search ? String(req.query.search) : undefined,
    sort: req.query.sort as EstimateSort,
    cursor: req.query.cursor ? String(req.query.cursor) : undefined,
    take: req.query.take ? Number(req.query.take) : undefined,
  };

  const estimates = await service.getEstimateRequestsService(params);

  res.status(HTTP_STATUS.OK).json({ success: true, data: estimates });
});

// 견적 보내기(기사)
export const createEstimate = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user!.id;
  const { estimateRequestId } = req.params;

  const data: CreateEstimateParams = {
    estimateRequestId,
    price: Number(req.body.price),
    comment: String(req.body.comment),
    driverId,
  };

  const estimate = await service.createEstimateService(data);

  res.status(HTTP_STATUS.OK).json({ success: true, data: estimate });
});

// 견적 반려(기사)
export const createEstimateReject = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user!.id;
  const { estimateRequestId } = req.params;

  const data: CreateEstimateRejectParams = {
    estimateRequestId,
    rejectReason: String(req.body.rejectReason),
    driverId,
  };

  const estimate = await service.createEstimateRejectService(data);

  res.status(HTTP_STATUS.OK).json({ success: true, data: estimate });
});

// 확정 견적 목록 조회
export const getEstimateConfirm = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user!.id;

  const data: GetEstimateParams = {
    driverId,
    sort: req.query.sort as EstimateSort,
    cursor: req.query.cursor ? String(req.query.cursor) : null,
    take: req.query.take ? Number(req.query.take) : undefined,
  };

  const estimateConfirm = await service.getEstimateConfirmService(data);

  res.status(HTTP_STATUS.OK).json({ success: true, data: estimateConfirm });
});

// 확정 견적 상세 조회
export const getEstimateConfirmId = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user!.id;
  const { estimateId } = req.params;

  const estimate = await service.getEstimateConfirmIdService(estimateId, driverId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: estimate,
  });
});

// 반려 견적 목록 조회
export const getEstimateReject = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user!.id;

  const data: GetEstimateParams = {
    driverId,
    sort: req.query.sort as EstimateSort,
    cursor: req.query.cursor ? String(req.query.cursor) : null,
    take: req.query.take ? Number(req.query.take) : undefined,
  };

  const estimateReject = await service.getEstimateRejectService(data);

  res.status(HTTP_STATUS.OK).json({ success: true, data: estimateReject });
});
