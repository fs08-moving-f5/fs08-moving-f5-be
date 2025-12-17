import { Router } from 'express';
import { authenticate } from '@/middlewares/authMiddleware';
import {
  confirmEstimateController,
  getEstimateDetailController,
  getPendingEstimatesController,
  getReceivedEstimatesController,
} from './estimate.controller';

const router = Router();

router.get('/pending', authenticate, getPendingEstimatesController);

router.get('/received', authenticate, getReceivedEstimatesController);

router.get('/:estimateId', authenticate, getEstimateDetailController);

router.post('/:estimateId/confirm', authenticate, confirmEstimateController);

export default router;
