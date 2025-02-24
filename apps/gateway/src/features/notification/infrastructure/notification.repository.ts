import { Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as GatewayPrismaClient,
  Notification,
} from '@prisma/gateway';
import { NotificationEntity } from '../domain/notification.entity';
import { CreateNotificationDto } from '../domain/types';

@Injectable()
export class NotificationRepository {
  private readonly TRANSACTION_TIMEOUT: number = 50000;
  constructor(
    private readonly logger: LoggerService,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) {
    this.logger.setContext(NotificationRepository.name);
  }

  async create(
    notificationDto: CreateNotificationDto,
  ): Promise<NotificationEntity> {
    this.logger.debug('Execute: create notification into db', this.create.name);
    const notification: Notification = await this.txHost.tx.notification.create(
      {
        data: {
          createdAt: notificationDto.createdAt,
          message: notificationDto.message,
          userId: notificationDto.userId,
          isRead: notificationDto.isRead,
        },
      },
    );
    return new NotificationEntity(notification);
  }

  async createMany(
    newNotifications: CreateNotificationDto[],
  ): Promise<NotificationEntity[]> {
    this.logger.debug(
      'Execute: create many notifications into db',
      this.createMany.name,
    );
    return await this.txHost.withTransaction(
      { timeout: this.TRANSACTION_TIMEOUT },
      async (): Promise<NotificationEntity[]> => {
        const promises = newNotifications.map((notification: Notification) => {
          return this.txHost.tx.notification.create({
            data: notification,
          });
        });

        const result = await Promise.all(promises);
        return result.map(
          (notification: Notification) => new NotificationEntity(notification),
        );
      },
    );
  }

  async readNotification(notification: NotificationEntity): Promise<void> {
    this.logger.debug('Execute: read notification', this.readNotification.name);
    await this.txHost.tx.notification.update({
      where: { id: notification.id },
      data: { isRead: notification.isRead, updateAt: notification.updateAt },
    });
  }

  async getNotificationById(
    notificationId: string,
  ): Promise<NotificationEntity | null> {
    this.logger.debug(
      'Execute: get notification by id from db',
      this.getNotificationById.name,
    );
    const notification = await this.txHost.tx.notification.findUnique({
      where: { id: notificationId },
    });

    return notification ? new NotificationEntity(notification) : null;
  }
}
