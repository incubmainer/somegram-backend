import { Notification } from '@prisma/gateway';
import { AggregateRoot } from '@nestjs/cqrs';
import { CreatedNotificationEvent } from '../application/event/created-notification.event';

export class NotificationEntity extends AggregateRoot implements Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updateAt: Date;

  constructor(dto: Notification) {
    super();
    this.id = dto.id;
    this.userId = dto.userId;
    this.message = dto.message;
    this.isRead = dto.isRead;
    this.createdAt = dto.createdAt;
    this.updateAt = dto.updateAt;
  }

  newNotificationEvent(): void {
    this.apply(new CreatedNotificationEvent(this.id, this.userId));
  }

  markAsRead(): void {
    this.isRead = true;
    this.updateAt = new Date();
  }
}
