import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { NotificationEntity } from '../../domain/notification.entity';
import { Inject } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructure/notification.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CreatedNotificationEvent } from '../event/created-notification.event';

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
    private readonly userRepository: UsersRepository,
    private readonly eventBus: EventBus,
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
      // @ts-ignore TODO:
      const user = await this.userRepository.getUserById(userId);
      if (!user) return this.appNotification.notFound();
      const notification = this.notificationEntity.create(userId, message);
      const result: string =
        await this.notificationRepository.create(notification);
      this.eventBus.publish(new CreatedNotificationEvent(result, userId));
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
