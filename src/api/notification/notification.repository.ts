import prisma from '../../config/prisma.js';
import { NotificationType } from '../../generated/enums.js';
import { Prisma } from '../../generated/client.js';

export const getUnreadNotificationCountRepository = async ({ userId }: { userId: string }) => {
  return await prisma.notification.count({
    where: {
      userId,
      isRead: false,
      isDelete: false,
    },
  });
};

export const createNotificationRepository = async (params: {
  userId: string;
  type: NotificationType;
  message: string;
  tx?: Prisma.TransactionClient;
}) => {
  return await (params.tx ?? prisma).notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      message: params.message,
      isRead: false,
      isDelete: false,
    },
  });
};

export const getNotificationsRepository = async ({ userId }: { userId: string }) => {
  return await prisma.notification.findMany({
    where: {
      userId,
      isDelete: false,
      isRead: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 30,
    select: {
      id: true,
      type: true,
      message: true,
      isRead: true,
      createdAt: true,
    },
  });
};

export const readNotificationRepository = async ({
  userId,
  notificationId,
}: {
  userId: string;
  notificationId: string;
}) => {
  return await prisma.notification.update({
    where: {
      id: notificationId,
      userId,
      isDelete: false,
    },
    data: {
      isRead: true,
    },
    select: {
      id: true,
      type: true,
      message: true,
      isRead: true,
      createdAt: true,
    },
  });
};
