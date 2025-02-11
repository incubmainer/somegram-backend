import { Notification } from '@prisma/gateway';

export class NotificationEntity implements Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updateAt: Date;

  static create(userId: string, message: string): NotificationEntity {
    const notification = new this();
    notification.userId = userId;
    notification.message = message;
    notification.isRead = false;
    notification.createdAt = new Date();
    return notification;
  }

  static markAsRead(notification: NotificationEntity): void {
    notification.isRead = true;
    notification.updateAt = new Date();
  }
}
