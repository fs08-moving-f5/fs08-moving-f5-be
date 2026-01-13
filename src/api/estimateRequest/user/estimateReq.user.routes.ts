import { Router } from 'express';
import { authenticate, requireUser } from '@/middlewares/authMiddleware';
import {
  getEstimateRequestsInProgress,
  createEstimateRequest,
  createDesignatedEstimateRequest,
  createEstimateRequestWithGeocode,
} from './estimateReq.user.controller';
import { validateBodyMiddleware } from '@/middlewares/validateMiddleware';
import { createEstimateRequestWithGeocodeSchema } from './validators/estimateReq.user.validators';

const router = Router();

// 진행 중인 견적 조회 (유저)
router.get('/pending', authenticate, getEstimateRequestsInProgress);

// 견적 요청 (유저)
router.post('/request', authenticate, createEstimateRequest);

// 견적 요청 (좌표 값 변환 포함)
router.post(
  '/request/geocode',
  authenticate,
  requireUser,
  validateBodyMiddleware(createEstimateRequestWithGeocodeSchema),
  createEstimateRequestWithGeocode,
);

// 지정 견적 요청 (유저)
router.post('/request/designated', authenticate, createDesignatedEstimateRequest);

export default router;
