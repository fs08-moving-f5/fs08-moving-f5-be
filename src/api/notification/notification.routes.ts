import { Router } from 'express';
import { authenticate } from '@/middlewares/authMiddleware';
import {
  getNotificationsController,
  getNotificationStreamController,
  readNotificationController,
} from './notification.controller';

const router = Router();

router.get('/stream', authenticate, getNotificationStreamController);

router.get('/', authenticate, getNotificationsController);

router.patch('/:id', authenticate, readNotificationController);

export default router;
