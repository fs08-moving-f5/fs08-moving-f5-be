import { Router } from 'express';
import { getDriversController, updateDriverOfficeController } from './driver.controller';
import { validateQueryMiddleware, validateBodyMiddleware } from '@/middlewares/validateMiddleware';
import { getDriversQueryValidator } from './validators/driver.validator';
import { authenticate, requireDriver } from '@/middlewares/authMiddleware';
import { updateDriverOfficeBodyValidator } from './validators/driver.validator';

const router = Router();

router.get('/', validateQueryMiddleware(getDriversQueryValidator), getDriversController);

router.patch(
  '/me/office',
  authenticate,
  requireDriver,
  validateBodyMiddleware(updateDriverOfficeBodyValidator),
  updateDriverOfficeController,
);

export default router;
