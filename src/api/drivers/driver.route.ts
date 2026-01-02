import { Router } from 'express';
import { getDriverStatusController } from './driver.controller';
import { authenticate } from '@/middlewares/authMiddleware';

const router = Router();

router.get('/status', getDriverStatusController);

export default router;
