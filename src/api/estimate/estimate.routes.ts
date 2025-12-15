import { Router } from 'express';
import {
  getEstimateRequestsController,
  createEstimateController,
  createEstimateRejectController,
} from './estimate.controller';
import fakeAuthMiddleware from '../../middlewares/fakeAuthMiddleware';

const router = Router();

// router.get('/pending');

// 받은 견적 요청 리스트 조회 (기사)
router.get('/requests', fakeAuthMiddleware, getEstimateRequestsController);

// 견적 보내기 (기사)
router.post('/create', fakeAuthMiddleware, createEstimateController);

// 견적 반려 (기사)
router.post('/reject', fakeAuthMiddleware, createEstimateRejectController);

export default router;
