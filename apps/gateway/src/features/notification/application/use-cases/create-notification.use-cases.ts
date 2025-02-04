import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { NotificationEntity } from '../../domain/notification.entity';
import { Inject } from '@nestjs/common';
import { NotificationRepository } from '../../infrastructure/notification.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

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
      AppNotificationResultType<string>
    >
{
  constructor(
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    @Inject(NotificationEntity.name)
    private readonly notificationEntity: typeof NotificationEntity,
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UsersRepository,
  ) {
    this.logger.setContext(CreateNotificationUseCaseHandler.name);
  }
  async execute(
    command: CreateNotificationUseCases,
  ): Promise<AppNotificationResultType<string>> {
    this.logger.debug(
      'Execute: Create notification command',
      this.execute.name,
    );
    const { userId, message } = command;
    try {
      const user = await this.userRepository.getUserById(userId);
      if (!user) return this.appNotification.notFound();

      const notification = this.notificationEntity.create(userId, message);
      const result: string =
        await this.notificationRepository.create(notification);
      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
