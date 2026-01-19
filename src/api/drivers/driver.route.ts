import { Router } from 'express';
import {
  getDriversController,
  getNearbyRequestsController,
  updateDriverOfficeController,
} from './driver.controller.js';
import { validateQueryMiddleware, validateBodyMiddleware } from '../../middlewares/validateMiddleware.js';
import { getDriversQueryValidator } from './validators/driver.validator.js';
import { authenticate, requireDriver, optionalAuthenticate } from '../../middlewares/authMiddleware.js';
import {
  getNearbyRequestsQueryValidator,
  updateDriverOfficeBodyValidator,
} from './validators/driver.validator.js';

const router = Router();

router.get(
  '/',
  optionalAuthenticate,
  validateQueryMiddleware(getDriversQueryValidator),
  getDriversController,
);

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
