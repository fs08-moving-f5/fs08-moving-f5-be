import { Router } from 'express';
import { getDriversController } from './driver.controller';
import { validateQueryMiddleware } from '@/middlewares/validateMiddleware';
import { getDriversQueryValidator } from './validators/driver.validator';

const router = Router();

router.get('/', validateQueryMiddleware(getDriversQueryValidator), getDriversController);

export default router;
