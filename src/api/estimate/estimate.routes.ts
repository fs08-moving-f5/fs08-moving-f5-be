import { Router } from 'express';
import fakeAuthMiddleware from '../../middlewares/fakeAuthMiddleware';
import { confirmEstimateController, getPendingEstimatesController } from './estimate.controller';

const router = Router();

router.get('/pending', fakeAuthMiddleware, getPendingEstimatesController);

router.post('/:estimateId/confirm', fakeAuthMiddleware, confirmEstimateController);

export default router;
