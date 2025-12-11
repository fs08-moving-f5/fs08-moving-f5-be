import { Router } from 'express';
import fakeAuthMiddleware from '../../middlewares/fakeAuthMiddleware';
import {
  confirmEstimateController,
  getEstimateDetailController,
  getPendingEstimatesController,
  getReceivedEstimatesController,
} from './estimate.controller';

const router = Router();

router.get('/pending', fakeAuthMiddleware, getPendingEstimatesController);

router.get('/received', fakeAuthMiddleware, getReceivedEstimatesController);

router.get('/:estimateId', fakeAuthMiddleware, getEstimateDetailController);

router.post('/:estimateId/confirm', fakeAuthMiddleware, confirmEstimateController);

export default router;
