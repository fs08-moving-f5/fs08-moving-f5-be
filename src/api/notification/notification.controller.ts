import HTTP_STATUS from '../../constants/http.constant';
import asyncHandler from '../../middlewares/asyncHandler';
import { addSseClient, removeSseClient } from './lib/sseHub';
import {
  getNotificationsService,
  pushUnreadCount,
  readNotificationService,
} from './notification.service';

export const getNotificationStreamController = asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Nginx 프록시 환경에서 필요
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.flushHeaders?.();

  addSseClient(userId, res);

  await pushUnreadCount({ userId });

  const heartbeat = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch {}
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeSseClient(userId, res);
  });
});

export const getNotificationsController = asyncHandler(async (req, res) => {
  const userId = req.user!.id;

  const notifications = await getNotificationsService({ userId });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: notifications,
  });
});

export const readNotificationController = asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const notificationId = req.params.id;

  await readNotificationService({ userId, notificationId });

  await pushUnreadCount({ userId });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: null,
  });
});
