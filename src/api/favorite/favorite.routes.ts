import { Router } from 'express';
import { authenticate, requireUserOrDriver } from '../../middlewares/authMiddleware.js';
import {
  addFavoriteDriverController,
  deleteFavoriteDriverController,
  deleteManyFavoriteDriverController,
  getFavoriteDriversController,
} from './favorite.controller.js';
import {
  validateParamsMiddleware,
  validateBodyMiddleware,
  validateQueryMiddleware,
} from '../../middlewares/validateMiddleware.js';
import {
  deleteManyFavoriteDriverBodyValidator,
  driverIdParamsValidator,
  getFavoriteDriversQueryValidator,
} from './validators/favorite.validators.js';

const router = Router();

router.get(
  '/',
  authenticate,
  requireUserOrDriver,
  validateQueryMiddleware(getFavoriteDriversQueryValidator),
  getFavoriteDriversController,
);

router.delete(
  '/driver',
  authenticate,
  requireUserOrDriver,
  validateBodyMiddleware(deleteManyFavoriteDriverBodyValidator),
  deleteManyFavoriteDriverController,
);

router.post(
  '/driver/:driverId',
  authenticate,
  requireUserOrDriver,
  validateParamsMiddleware(driverIdParamsValidator),
  addFavoriteDriverController,
);

router.delete(
  '/driver/:driverId',
  authenticate,
  requireUserOrDriver,
  validateParamsMiddleware(driverIdParamsValidator),
  deleteFavoriteDriverController,
);

export default router;
