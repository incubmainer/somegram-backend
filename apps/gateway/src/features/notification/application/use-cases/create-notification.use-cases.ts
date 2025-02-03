import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { NotificationEntity } from '../../domain/notification.entity';
import { Inject } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructure/notification.repository';

export class CreateNotificationUseCases {
  constructor(
    public userId: string,
    public message: string,
  ) {}
}

@CommandHandler(CreateNotificationUseCases)
export class CreateNotificationUseCaseHandler
  implements
    ICommandHandler<
      CreateNotificationUseCases,
      AppNotificationResultType<null>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    @Inject(NotificationEntity.name)
    private readonly notificationEntity: typeof NotificationEntity,
    private readonly notificationRepository: NotificationRepository,
  ) {
    this.logger.setContext(CreateNotificationUseCaseHandler.name);
  }
  async execute(
    command: CreateNotificationUseCases,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug(
      'Execute: Create notification command',
      this.execute.name,
    );
    const { userId, message } = command;
    try {
      const notification = this.notificationEntity.create(userId, message);
      // TODO Return?
      await this.notificationRepository.create(notification);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
