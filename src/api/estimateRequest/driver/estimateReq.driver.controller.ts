import { Request, Response } from 'express';
import * as service from './estimateReq.driver.service';
import {
  GetEstimateRequestsParams,
  CreateEstimateParams,
  CreateEstimateRejectParams,
  EstimateSort,
  GetEstimateParams,
} from '@/types/driverEstimate';
import { ServiceEnum, EstimateStatus } from '@/generated/enums';
import asyncHandler from '@/middlewares/asyncHandler';

// 받은 요청 목록 조회(기사)
export const getEstimateRequests = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user.id;

  const params: GetEstimateRequestsParams = {
    driverId,
    movingType: req.query.movingType as ServiceEnum,
    movingDate: req.query.movingDate ? new Date(String(req.query.movingDate)) : undefined,
    isDesignated: req.query.isDesignated === 'true',
    status: req.query.status as EstimateStatus,
    serviceRegionFilter: req.query.serviceRegionFilter === 'true',
    search: req.query.search ? String(req.query.search) : undefined,
    sort: req.query.sort as EstimateSort,
    cursor: req.query.cursor ? String(req.query.cursor) : null,
    take: req.query.take ? Number(req.query.take) : undefined,
  };

  const estimates = await service.getEstimateRequestsService(params);

  res.status(200).json({ message: '받은 견적 요청 목록 조회 성공', data: estimates });
});

// 견적 보내기(기사)
export const createEstimate = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user.id;

  const data: CreateEstimateParams = {
    estimateRequestId: req.body.estimateRequestId,
    price: Number(req.body.price),
    comment: String(req.body.comment),
    driverId,
  };

  const estimate = await service.createEstimateService(data);

  res.status(200).json({ message: '견적 보내기 성공', data: estimate });
});

// 견적 반려(기사)
export const createEstimateReject = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user.id;

  const data: CreateEstimateRejectParams = {
    estimateRequestId: req.body.estimateRequestId,
    rejectReason: String(req.body.rejectReason),
    driverId,
  };

  const estimate = await service.createEstimateRejectService(data);

  res.status(200).json({ message: '견적 반려 성공', data: estimate });
});

// 확정 견적 목록 조회
export const getEstimateConfirm = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user.id;

  const data: GetEstimateParams = {
    driverId,
    sort: req.query.sort as EstimateSort,
    cursor: req.query.cursor ? String(req.query.cursor) : null,
    take: req.query.take ? Number(req.query.take) : undefined,
  };

  const estimateConfirm = await service.getEstimateConfirmService(data);

  res.status(200).json({ message: '확정 견적 목록 조회 성공', data: estimateConfirm });
});

// 확정 견적 상세 조회
export const getEstimateConfirmId = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user.id;
  const { estimateId } = req.params;

  const estimate = await service.getEstimateConfirmIdService(estimateId, driverId);

  res.status(200).json({
    message: '확정 견적 상세 조회 성공',
    data: estimate,
  });
});

// 반려 견적 목록 조회
export const getEstimateReject = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user.id;

  const data: GetEstimateParams = {
    driverId,
    sort: req.query.sort as EstimateSort,
    cursor: req.query.cursor ? String(req.query.cursor) : null,
    take: req.query.take ? Number(req.query.take) : undefined,
  };

  const estimateReject = await service.getEstimateRejectService(data);

  res.status(200).json({ message: '반려 견적 목록 조회 성공', data: estimateReject });
});
