import { Router } from 'express';
import { authenticate } from '@/middlewares/authMiddleware';
import {
  getEstimateRequestsInProgress,
  createEstimateRequest,
} from './estimateReq.user.controller';

const router = Router();

// 진행 중인 견적 조회 (유저)
router.get('/pending', authenticate, getEstimateRequestsInProgress);
// 견적 요청 (유저)
router.post('/request', authenticate, createEstimateRequest);

export default router;
