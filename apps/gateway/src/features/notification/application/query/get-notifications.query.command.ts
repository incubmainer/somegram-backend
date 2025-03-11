import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import {
  NotificationOutputDto,
  NotificationOutputDtoMapper,
} from '../../api/dto/output-dto/notification.output.dto';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as GatewayPrismaClient,
  Notification,
} from '@prisma/gateway';

export class GetNotificationsByUserIdQueryCommand {
  constructor(public userId: string) {}
}

@QueryHandler(GetNotificationsByUserIdQueryCommand)
export class GetNotificationsByUserIdQueryCommandHandler
  implements
    IQueryHandler<
      GetNotificationsByUserIdQueryCommand,
      AppNotificationResultType<NotificationOutputDto[]>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly notificationOutputDtoMapper: NotificationOutputDtoMapper,
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) {
    this.logger.setContext(GetNotificationsByUserIdQueryCommandHandler.name);
  }

  async execute(
    query: GetNotificationsByUserIdQueryCommand,
  ): Promise<AppNotificationResultType<NotificationOutputDto[]>> {
    this.logger.debug(
      'Execute: get notification by user id',
      this.execute.name,
    );
    const { userId } = query;
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const notifications: Notification[] =
        await this.txHost.tx.notification.findMany({
          where: {
            userId: userId,
            createdAt: {
              gte: oneMonthAgo,
            },
          },
        });

      return this.appNotification.success(
        this.notificationOutputDtoMapper.mapNotifications(notifications),
      );
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
