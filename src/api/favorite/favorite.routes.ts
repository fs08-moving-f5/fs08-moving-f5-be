import { Router } from 'express';
import { authenticate } from '@/middlewares/authMiddleware';
import {
  addFavoriteDriverController,
  deleteFavoriteDriverController,
  deleteManyFavoriteDriverController,
  getFavoriteDriversController,
} from './favorite.controller';

const router = Router();

router.get('/', authenticate, getFavoriteDriversController);

router.delete('/driver', authenticate, deleteManyFavoriteDriverController);

router.post('/driver/:driverId', authenticate, addFavoriteDriverController);

router.delete('/driver/:driverId', authenticate, deleteFavoriteDriverController);

export default router;
