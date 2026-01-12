import { Router } from 'express';
import {
  getDriversController,
  getNearbyRequestsController,
  updateDriverOfficeController,
} from './driver.controller';
import { validateQueryMiddleware, validateBodyMiddleware } from '@/middlewares/validateMiddleware';
import { getDriversQueryValidator } from './validators/driver.validator';
import { authenticate, requireDriver } from '@/middlewares/authMiddleware';
import {
  getNearbyRequestsQueryValidator,
  updateDriverOfficeBodyValidator,
} from './validators/driver.validator';

const router = Router();

router.get('/', validateQueryMiddleware(getDriversQueryValidator), getDriversController);

router.patch(
  '/me/office',
  authenticate,
  requireDriver,
  validateBodyMiddleware(updateDriverOfficeBodyValidator),
  updateDriverOfficeController,
);

router.get(
  '/me/requests/nearby',
  authenticate,
  requireDriver,
  validateQueryMiddleware(getNearbyRequestsQueryValidator),
  getNearbyRequestsController,
);

export default router;
