import { Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
// import { Notification, Prisma } from '@prisma/client';
// import { PrismaService } from '../../../../../notification/src/common/adapters/prisma/prisma.service';
import {
  PrismaClient as GatewayPrismaClient,
  Notification,
} from '@prisma/gateway';

@Injectable()
export class NotificationRepository {
  constructor(
    private readonly logger: LoggerService,
    //private readonly prisma: PrismaService,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) {
    this.logger.setContext(NotificationRepository.name);
  }

  // TODO Для обычной призмы без обертки CLS Transaction
  // async create(newNotification: Notification): Promise<string> {
  //   this.logger.debug('Execute: create notification into db', this.create.name);
  //   const notification: Notification = await this.prisma.notification.create({
  //     data: newNotification,
  //   });
  //   return notification.id;
  // }
  //
  // async update(
  //   notification: Notification,
  //   tx?: Prisma.TransactionClient,
  // ): Promise<void> {
  //   this.logger.debug('Execute: update notification into db', this.update.name);
  //
  //   if (tx) {
  //     await tx.notification.update({
  //       where: { id: notification.id },
  //       data: notification,
  //     });
  //     return;
  //   }
  //
  //   await this.prisma.notification.update({
  //     where: { id: notification.id },
  //     data: notification,
  //   });
  // }
  //
  // async getNotificationById(
  //   notificationId: string,
  //   tx?: Prisma.TransactionClient,
  // ): Promise<Notification | null> {
  //   this.logger.debug(
  //     'Execute: get notification by id from db',
  //     this.getNotificationById.name,
  //   );
  //
  //   if (tx) {
  //     const notification: Notification | null =
  //       await tx.notification.findUnique({
  //         where: { id: notificationId },
  //       });
  //
  //     if (!notification) return null;
  //
  //     await tx.$queryRaw`SELECT * FROM "Notification" WHERE id = ${notificationId} FOR UPDATE`;
  //     return notification;
  //   }
  //   return this.prisma.notification.findUnique({
  //     where: { id: notificationId },
  //   });
  // }

  async create(newNotification: Notification): Promise<string> {
    this.logger.debug('Execute: create notification into db', this.create.name);
    const notification: Notification = await this.txHost.tx.notification.create(
      {
        data: newNotification,
      },
    );
    return notification.id;
  }

  async update(notification: Notification): Promise<void> {
    this.logger.debug('Execute: update notification into db', this.update.name);

    await this.txHost.tx.notification.update({
      where: { id: notification.id },
      data: notification,
    });
  }

  async getNotificationById(
    notificationId: string,
  ): Promise<Notification | null> {
    this.logger.debug(
      'Execute: get notification by id from db',
      this.getNotificationById.name,
    );
    return this.txHost.tx.notification.findUnique({
      where: { id: notificationId },
    });
  }
}
