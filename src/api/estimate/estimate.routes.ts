import { Router } from 'express';
import { authenticate } from '../../middlewares/authMiddleware.js';
import {
  confirmEstimateController,
  getEstimateDetailController,
  getPendingEstimatesController,
  getReceivedEstimatesController,
} from './estimate.controller.js';
import {
  validateQueryMiddleware,
  validateParamsMiddleware,
} from '../../middlewares/validateMiddleware.js';
import {
  estimateIdParamsValidator,
  receiveEstimateRequestQueryValidator,
} from './validators/estimate.validators.js';
import { requireUser } from '../../middlewares/authMiddleware.js';

const router = Router();

router.get('/pending', authenticate, requireUser, getPendingEstimatesController);

router.get(
  '/received',
  authenticate,
  requireUser,
  validateQueryMiddleware(receiveEstimateRequestQueryValidator),
  getReceivedEstimatesController,
);

router.get(
  '/:estimateId',
  authenticate,
  requireUser,
  validateParamsMiddleware(estimateIdParamsValidator),
  getEstimateDetailController,
);

router.post(
  '/:estimateId/confirm',
  authenticate,
  requireUser,
  validateParamsMiddleware(estimateIdParamsValidator),
  confirmEstimateController,
);

export default router;
