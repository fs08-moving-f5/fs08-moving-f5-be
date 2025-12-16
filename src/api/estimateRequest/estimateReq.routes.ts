//
import { Router } from 'express';
import * as controller from './estimateReq.controller';
import fakeAuthMiddleware from '../../middlewares/fakeAuthMiddleware';

const router = Router();

// 받은 견적 요청 목록 조회 (기사)
router.get('/requests', fakeAuthMiddleware, controller.getEstimateRequests);

// 견적 보내기 (기사)
router.post('/requests/:estimateRequestId/create', fakeAuthMiddleware, controller.createEstimate);

// 견적 반려 (기사)
router.post(
  '/requests/:estimateRequestId/reject',
  fakeAuthMiddleware,
  controller.createEstimateReject,
);

// 확정 견적 목록 조회 (기사)
router.get('/confirms', fakeAuthMiddleware, controller.getEstimateConfirm);

// 확정 견적 상세 조회 (기사)
router.get('/confirms/:estimateId', fakeAuthMiddleware, controller.getEstimateConfirmId);

// 반려 견적 목록 조회 (기사)
router.get('/rejects', fakeAuthMiddleware, controller.getEstimateReject);

export default router;
