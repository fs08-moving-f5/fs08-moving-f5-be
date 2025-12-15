import { Router } from 'express';
import fakeAuthMiddleware from '../../middlewares/fakeAuthMiddleware';
import { addFavoriteDriverController, deleteFavoriteDriverController } from './favorite.controller';

const router = Router();

router.post('/driver/:driverId', fakeAuthMiddleware, addFavoriteDriverController);

router.delete('/driver/:driverId', fakeAuthMiddleware, deleteFavoriteDriverController);

export default router;
