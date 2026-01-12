import { Router } from 'express';
import { getDriversController } from './driver.controller';
import validateMiddleware from '@/middlewares/validateMiddleware';
import { getDriversQueryValidator } from './validators/driver.validator';

const router = Router();

router.get('/', validateMiddleware(getDriversQueryValidator), getDriversController);

export default router;
