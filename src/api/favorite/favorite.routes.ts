import { Router } from 'express';
import fakeAuthMiddleware from '../../middlewares/fakeAuthMiddleware';
import {
  addFavoriteDriverController,
  deleteFavoriteDriverController,
  deleteManyFavoriteDriverController,
  getFavoriteDriversController,
} from './favorite.controller';

const router = Router();

router.get('/', fakeAuthMiddleware, getFavoriteDriversController);

router.delete('/driver', fakeAuthMiddleware, deleteManyFavoriteDriverController);

router.post('/driver/:driverId', fakeAuthMiddleware, addFavoriteDriverController);

router.delete('/driver/:driverId', fakeAuthMiddleware, deleteFavoriteDriverController);

export default router;
