//
import { Router } from 'express';
import {
  getEstimateRequestsController,
  createEstimateController,
  createEstimateRejectController,
} from './estimateReq.controller';
import fakeAuthMiddleware from '../../middlewares/fakeAuthMiddleware';

const router = Router();

// 받은 견적 요청 목록 조회 (기사)
router.get('/requests', fakeAuthMiddleware, getEstimateRequestsController);

// 견적 보내기 (기사)
router.post('/create', fakeAuthMiddleware, createEstimateController);

// 견적 반려 (기사)
router.post('/reject', fakeAuthMiddleware, createEstimateRejectController);

export default router;
