import { pushSseEvent } from './lib/sseHub';
import {
  createNotificationRepository,
  getNotificationsRepository,
  getUnreadNotificationCountRepository,
  readNotificationRepository,
} from './notification.repository';
import { NotificationType } from '../../generated/enums';
import { Prisma } from '@/generated/client';

export const pushUnreadCount = async ({ userId }: { userId: string }) => {
  const count = await getUnreadNotificationCountRepository({ userId });

  pushSseEvent(userId, 'unreadCount', { count });
};

export const createNotificationAndPushUnreadService = async (params: {
  userId: string;
  type: NotificationType;
  message: string;
  tx?: Prisma.TransactionClient;
}) => {
  await createNotificationRepository({ ...params, tx: params.tx });

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
