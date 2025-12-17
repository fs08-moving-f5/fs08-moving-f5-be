import { Router } from 'express';
import {
  getNotificationsController,
  getNotificationStreamController,
  readNotificationController,
} from './notification.controller';
import fakeAuthMiddleware from '../../middlewares/fakeAuthMiddleware';

const router = Router();

router.get('/stream', fakeAuthMiddleware, getNotificationStreamController);

router.get('/', fakeAuthMiddleware, getNotificationsController);

router.patch('/:id', fakeAuthMiddleware, readNotificationController);

export default router;
