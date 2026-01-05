import { Router } from 'express';
import { authenticate } from '@/middlewares/authMiddleware';
import {
  getEstimateRequestsInProgress,
  createEstimateRequest,
  createDesignatedEstimateRequest,
} from './estimateReq.user.controller';

const router = Router();

// 진행 중인 견적 조회 (유저)
router.get('/pending', authenticate, getEstimateRequestsInProgress);
// 견적 요청 (유저)
router.post('/request', authenticate, createEstimateRequest);

// 지정 견적 요청 (유저)
router.post('/request/designated', authenticate, createDesignatedEstimateRequest);

export default router;
