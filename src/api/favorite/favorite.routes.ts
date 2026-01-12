import { Router } from 'express';
import { authenticate, requireUserOrDriver } from '@/middlewares/authMiddleware';
import {
  addFavoriteDriverController,
  deleteFavoriteDriverController,
  deleteManyFavoriteDriverController,
  getFavoriteDriversController,
} from './favorite.controller';
import validateMiddleware from '@/middlewares/validateMiddleware';
import {
  deleteManyFavoriteDriverBodyValidator,
  driverIdParamsValidator,
  getFavoriteDriversQueryValidator,
} from './validators/favorite.validators';

const router = Router();

router.get(
  '/',
  authenticate,
  requireUserOrDriver,
  validateMiddleware(getFavoriteDriversQueryValidator),
  getFavoriteDriversController,
);

router.delete(
  '/driver',
  authenticate,
  requireUserOrDriver,
  validateMiddleware(deleteManyFavoriteDriverBodyValidator),
  deleteManyFavoriteDriverController,
);

router.post(
  '/driver/:driverId',
  authenticate,
  requireUserOrDriver,
  validateMiddleware(driverIdParamsValidator),
  addFavoriteDriverController,
);

router.delete(
  '/driver/:driverId',
  authenticate,
  requireUserOrDriver,
  validateMiddleware(driverIdParamsValidator),
  deleteFavoriteDriverController,
);

export default router;
