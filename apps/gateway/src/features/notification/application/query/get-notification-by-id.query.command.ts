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

export class GetNotificationByIdQueryCommand {
  constructor(public id: string) {}
}

@QueryHandler(GetNotificationByIdQueryCommand)
export class GetNotificationByIdQueryCommandHandler
  implements
    IQueryHandler<
      GetNotificationByIdQueryCommand,
      AppNotificationResultType<NotificationOutputDto>
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
    this.logger.setContext(GetNotificationByIdQueryCommandHandler.name);
  }

  async execute(
    query: GetNotificationByIdQueryCommand,
  ): Promise<AppNotificationResultType<NotificationOutputDto>> {
    this.logger.debug('Execute: get notification by id', this.execute.name);
    const { id } = query;
    try {
      const notification: Notification | null =
        await this.txHost.tx.notification.findUnique({
          where: {
            id: id,
          },
        });

      if (!notification) return this.appNotification.notFound();

      return this.appNotification.success(
        this.notificationOutputDtoMapper.mapNotification(notification),
      );
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
