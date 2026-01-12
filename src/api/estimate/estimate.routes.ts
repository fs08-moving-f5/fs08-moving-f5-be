import { Router } from 'express';
import { authenticate } from '@/middlewares/authMiddleware';
import {
  confirmEstimateController,
  getEstimateDetailController,
  getPendingEstimatesController,
  getReceivedEstimatesController,
} from './estimate.controller';
import validateMiddleware from '@/middlewares/validateMiddleware';
import {
  estimateIdParamsValidator,
  receiveEstimateRequestQueryValidator,
} from './validators/estimate.validators';
import { requireUser } from '@/middlewares/authMiddleware';

const router = Router();

router.get('/pending', authenticate, requireUser, getPendingEstimatesController);

router.get(
  '/received',
  authenticate,
  requireUser,
  validateMiddleware(receiveEstimateRequestQueryValidator),
  getReceivedEstimatesController,
);

router.get(
  '/:estimateId',
  authenticate,
  requireUser,
  validateMiddleware(estimateIdParamsValidator),
  getEstimateDetailController,
);

router.post(
  '/:estimateId/confirm',
  authenticate,
  requireUser,
  validateMiddleware(estimateIdParamsValidator),
  confirmEstimateController,
);

export default router;
