import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { NotificationRepository } from '../../infrastructure/notification.repository';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CreateNotificationInputDto } from '../../api/dto/input-dto/notification.input-dto';
import { NotificationEntity } from '../../domain/notification.entity';

export class CreateNotificationsUseCases {
  constructor(public inputDto: CreateNotificationInputDto[]) {}
}

@CommandHandler(CreateNotificationsUseCases)
export class CreateNotificationsUseCaseHandler
  implements
    ICommandHandler<
      CreateNotificationsUseCases,
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
    this.logger.setContext(CreateNotificationsUseCaseHandler.name);
  }
  async execute(
    command: CreateNotificationsUseCases,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug(
      'Execute: Create many notifications command',
      this.execute.name,
    );
    const { inputDto } = command;
    try {
      const userIds = inputDto.map((dto) => dto.userId);
      const users = await this.userRepository.getUsersByIds(userIds);

      const usersMap = new Map(users.map((user) => [user.id, user]));

      const validInputDto = inputDto.filter((dto) => usersMap.has(dto.userId));

      if (validInputDto.length === 0) return this.appNotification.notFound();

      const notificationsCreateDto = validInputDto.map((dto) => {
        const { userId, message } = dto;

        return {
          userId: userId,
          createdAt: new Date(),
          message: message,
          isRead: false,
        };
      });

      const newNotifications = await this.notificationRepository.createMany(
        notificationsCreateDto,
      );

      this.publish(newNotifications);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private publish(newNotifications: NotificationEntity[]): void {
    for (const notification of newNotifications) {
      const notificationWithEvent =
        this.publisher.mergeObjectContext(notification);

      notificationWithEvent.newNotificationEvent();
      notificationWithEvent.commit();
    }
  }
}
