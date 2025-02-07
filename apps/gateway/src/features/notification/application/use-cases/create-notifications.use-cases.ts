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
import { CreateNotificationInputDto } from '../../api/dto/input-dto/notification.input-dto';

export class CreateNotificationsUseCases {
  constructor(public inputDto: CreateNotificationInputDto[]) {}
}

@CommandHandler(CreateNotificationsUseCases)
export class CreateNotificationsUseCaseHandler
  implements
    ICommandHandler<
      CreateNotificationsUseCases,
      AppNotificationResultType<string[]>
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
    this.logger.setContext(CreateNotificationsUseCaseHandler.name);
  }
  async execute(
    command: CreateNotificationsUseCases,
  ): Promise<AppNotificationResultType<string[]>> {
    this.logger.debug(
      'Execute: Create many notifications command',
      this.execute.name,
    );
    const { inputDto } = command;
    try {
      const userIds = inputDto.map((dto) => dto.userId);
      const users = await this.userRepository.getUsersById(userIds);

      const usersMap = new Map(users.map((user) => [user.id, user]));

      const validInputDto = inputDto.filter((dto) => usersMap.has(dto.userId));

      if (validInputDto.length === 0) return this.appNotification.notFound();

      const notifications = validInputDto.map((dto) => {
        const { userId, message } = dto;
        return this.notificationEntity.create(userId, message);
      });

      const result =
        await this.notificationRepository.createMany(notifications);
      return this.appNotification.success(result);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
