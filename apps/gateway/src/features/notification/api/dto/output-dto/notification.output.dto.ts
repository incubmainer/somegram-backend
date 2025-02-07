import { ApiProperty } from '@nestjs/swagger';
import { Injectable } from '@nestjs/common';
import { Notification } from '@prisma/gateway';

export class NotificationOutputDto {
  @ApiProperty({
    type: String,
    example: 'notification-123',
    description: 'ID notification`s',
    nullable: false,
    required: true,
  })
  id: string;
  @ApiProperty({
    type: String,
    example: 'New notification',
    description: 'Notification message',
    nullable: false,
    required: true,
  })
  message: string;
  @ApiProperty({
    type: Boolean,
    example: false,
    nullable: false,
    description: 'Notification is read or not',
    required: true,
  })
  isRead: boolean;
  @ApiProperty({
    type: Date,
    example: new Date(),
    nullable: false,
    description: 'The date of the creation of notification',
    required: true,
  })
  createdAt: Date;
}

export class NotificationWithUserIdOutputDto {
  userId: string;
  dto: NotificationOutputDto;
}
@Injectable()
export class NotificationOutputDtoMapper {
  mapNotification(notification: Notification): NotificationOutputDto {
    return {
      id: notification.id,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    };
  }

  mapNotifications(notifications: Notification[]): NotificationOutputDto[] {
    return notifications.map((notification: Notification) =>
      this.mapNotification(notification),
    );
  }

  mapNotificationsWithUserId(
    notifications: Notification[],
  ): NotificationWithUserIdOutputDto[] {
    return notifications.map(
      (notification: Notification): NotificationWithUserIdOutputDto => {
        return {
          userId: notification.userId,
          dto: this.mapNotification(notification),
        };
      },
    );
  }
}
