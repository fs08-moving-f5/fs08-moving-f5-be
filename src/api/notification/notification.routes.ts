import { Router } from 'express';
import { authenticate } from '@/middlewares/authMiddleware';
import {
  getNotificationsController,
  getNotificationStreamController,
  readNotificationController,
} from './notification.controller';
import { validateParamsMiddleware } from '@/middlewares/validateMiddleware';
import { notificationIdParamsValidator } from './validators/notification.validators';

const router = Router();

router.get('/stream', authenticate, getNotificationStreamController);

router.get('/', authenticate, getNotificationsController);

router.patch(
  '/:id',
  authenticate,
  validateParamsMiddleware(notificationIdParamsValidator),
  readNotificationController,
);

export default router;
