//
import { Router } from 'express';
import * as controller from './estimateReq.driver.controller.js';
import { authenticate } from '../../../middlewares/authMiddleware.js';

const router = Router();

// 받은 견적 요청 목록 조회 (기사)
router.get('/requests', authenticate, controller.getEstimateRequests);

// 견적 보내기 (기사)
router.post('/requests/:estimateRequestId/create', authenticate, controller.createEstimate);

// 견적 반려 (기사)
router.post('/requests/:estimateRequestId/reject', authenticate, controller.createEstimateReject);

// 확정 견적 목록 조회 (기사)
router.get('/confirms', authenticate, controller.getEstimateConfirm);

// 확정 견적 상세 조회 (기사)
router.get('/confirms/:estimateId', authenticate, controller.getEstimateConfirmId);

// 반려 견적 목록 조회 (기사)
router.get('/rejects', authenticate, controller.getEstimateReject);

export default router;
