import { Router } from 'express';
import fakeAuthMiddleware from '../../middlewares/fakeAuthMiddleware';
import { addFavoriteDriverController } from './favorite.controller';

const router = Router();

router.post('/driver/:driverId', fakeAuthMiddleware, addFavoriteDriverController);

export default router;
