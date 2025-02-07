import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import {
  NotificationOutputDtoMapper,
  NotificationWithUserIdOutputDto,
} from '../../api/dto/output-dto/notification.output.dto';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import {
  PrismaClient as GatewayPrismaClient,
  Notification,
} from '@prisma/gateway';

export class GetNotificationsByIdQueryCommand {
  constructor(public ids: string[]) {}
}

@QueryHandler(GetNotificationsByIdQueryCommand)
export class GetNotificationsByIdQueryCommandHandler
  implements
    IQueryHandler<
      GetNotificationsByIdQueryCommand,
      AppNotificationResultType<NotificationWithUserIdOutputDto[]>
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
    this.logger.setContext(GetNotificationsByIdQueryCommandHandler.name);
  }

  async execute(
    query: GetNotificationsByIdQueryCommand,
  ): Promise<AppNotificationResultType<NotificationWithUserIdOutputDto[]>> {
    this.logger.debug('Execute: get notification by id', this.execute.name);
    const { ids } = query;
    try {
      const notifications: Notification[] =
        await this.txHost.tx.notification.findMany({
          where: { id: { in: ids } },
        });

      if (!notifications && notifications.length === 0)
        return this.appNotification.notFound();

      return this.appNotification.success(
        this.notificationOutputDtoMapper.mapNotificationsWithUserId(
          notifications,
        ),
      );
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
