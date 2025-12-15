import { Request, Response } from 'express';
import * as service from './estimateReq.service';
import {
  GetEstimateRequestsParams,
  CreateEstimateParams,
  CreateEstimateRejectParams,
  EstimateSort,
} from '../../types/driverEstimate';
import { ServiceEnum, EstimateStatus } from '../../generated/enums';
import { HttpError } from '../../types/error';
import asyncHandler from '../../middlewares/asyncHandler';

export const getPendingEstimatesController = asyncHandler(async (req, res) => {});

// 받은 요청 목록 조회(기사)
export const getEstimateRequestsController = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user.id;
  if (!driverId) {
    throw new HttpError('기사 로그인이 필요합니다.', 401);
  }

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

  res.status(200).json({ message: '받은 견적 요청 리스트 조회 성공', data: estimates });
});

// 견적 보내기(기사)
export const createEstimateController = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user.id;

  if (!driverId) {
    throw new HttpError('기사 로그인이 필요합니다.', 401);
  }

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
export const createEstimateRejectController = asyncHandler(async (req: Request, res: Response) => {
  const driverId = req.user.id;

  if (!driverId) {
    throw new HttpError('기사 로그인이 필요합니다.', 401);
  }

  const data: CreateEstimateRejectParams = {
    estimateRequestId: req.body.estimateRequestId,
    rejectReason: String(req.body.rejectReason),
    driverId,
  };

  const estimate = await service.createEstimateRejectService(data);

  res.status(200).json({ message: '견적 반려 성공', data: estimate });
});
