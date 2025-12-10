import { v4 as uuid } from 'uuid';
import { Notification, NotificationType } from './dataType';

/**
 * @param userIds - 모든 유저 ID 배열
 * @param countPerUser - 각 유저당 생성할 알림 수
 */
const mockNotifications = (userIds: string[], countPerUser = 10): Notification[] => {
  const notifications: Notification[] = [];
  const notificationTypes = Object.values(NotificationType);

  userIds.forEach((userId) => {
    for (let i = 0; i < countPerUser; i++) {
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
      notifications.push({
        id: uuid(),
        userId,
        type,
        message: `Sample message ${i + 1} for user ${userId} of type ${type}`,
        datajson: null,
        isRead: false,
        isDelete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  return notifications;
};

export default mockNotifications;
