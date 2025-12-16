import { pushSseEvent } from './lib/sseHub';
import {
  createNotificationRepository,
  getNotificationsRepository,
  getUnreadNotificationCountRepository,
  readNotificationRepository,
} from './notification.repository';
import { NotificationType } from '../../generated/enums';

export const pushUnreadCount = async ({ userId }: { userId: string }) => {
  const count = await getUnreadNotificationCountRepository({ userId });

  pushSseEvent(userId, 'unreadCount', { count });
};

export const createNotificationAndPushUnreadService = async (params: {
  userId: string;
  type: NotificationType;
  message: string;
}) => {
  await createNotificationRepository(params);

  await pushUnreadCount({ userId: params.userId });
};

export const getNotificationsService = async ({ userId }: { userId: string }) => {
  return await getNotificationsRepository({ userId });
};

export const readNotificationService = async ({
  userId,
  notificationId,
}: {
  userId: string;
  notificationId: string;
}) => {
  return await readNotificationRepository({ userId, notificationId });
};
