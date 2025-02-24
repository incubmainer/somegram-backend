import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { NotificationRepository } from '../../infrastructure/notification.repository';

export class MarkNotificationAsReadUseCases {
  constructor(
    public userId: string,
    public notificationId: string,
  ) {}
}

@CommandHandler(MarkNotificationAsReadUseCases)
export class MarkNotificationAsReadUseCaseHandler
  implements
    ICommandHandler<
      MarkNotificationAsReadUseCases,
      AppNotificationResultType<null>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly notificationRepository: NotificationRepository,
  ) {
    this.logger.setContext(MarkNotificationAsReadUseCaseHandler.name);
  }
  async execute(
    command: MarkNotificationAsReadUseCases,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug(
      'Execute: Mark notification as read command',
      this.execute.name,
    );
    const { userId, notificationId } = command;
    try {
      const notification =
        await this.notificationRepository.getNotificationById(notificationId);

      if (!notification) return this.appNotification.notFound();
      if (notification.userId !== userId)
        return this.appNotification.forbidden();
      if (notification.isRead) return this.appNotification.success(null);

      notification.markAsRead();
      await this.notificationRepository.readNotification(notification);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
