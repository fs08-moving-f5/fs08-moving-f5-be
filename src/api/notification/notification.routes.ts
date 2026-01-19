import { Router } from 'express';
import { authenticate } from '../../middlewares/authMiddleware.js';
import {
  getNotificationsController,
  getNotificationStreamController,
  readNotificationController,
} from './notification.controller.js';
import { validateParamsMiddleware } from '../../middlewares/validateMiddleware.js';
import { notificationIdParamsValidator } from './validators/notification.validators.js';

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
