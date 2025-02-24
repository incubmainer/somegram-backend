import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { NotificationEntity } from '../../domain/notification.entity';
import { NotificationRepository } from '../../infrastructure/notification.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CreateNotificationDto } from '../../domain/types';

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
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UsersRepository,
    private readonly publisher: EventPublisher,
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
      const user = await this.userRepository.getUserById(userId);
      if (!user) return this.appNotification.notFound();

      const createNotificationDto: CreateNotificationDto = {
        isRead: false,
        userId: userId,
        message,
        createdAt: new Date(),
      };

      const newNotification = await this.notificationRepository.create(
        createNotificationDto,
      );

      this.publish(newNotification);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private publish(newNotification: NotificationEntity): void {
    const notificationWithEvent =
      this.publisher.mergeObjectContext(newNotification);

    notificationWithEvent.newNotificationEvent();
    notificationWithEvent.commit();
  }
}
