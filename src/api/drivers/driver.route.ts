import { Router } from 'express';
import { getDriversController } from './driver.controller';

const router = Router();

router.get('/', getDriversController);

export default router;
