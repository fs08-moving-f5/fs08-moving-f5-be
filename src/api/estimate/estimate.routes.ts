import { Router } from 'express';
import fakeAuthMiddleware from '../../middlewares/fakeAuthMiddleware';
import { getPendingEstimatesController } from './estimate.controller';

const router = Router();

router.get('/pending', fakeAuthMiddleware, getPendingEstimatesController);

export default router;
