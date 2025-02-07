import { Controller } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import {
  CREATE_NOTIFICATION,
  CREATE_NOTIFICATIONS,
} from '../../../common/constants/service.constants';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateNotificationUseCases } from '../application/use-cases/create-notification.use-cases';
import { CreateNotificationInputDto } from './dto/input-dto/notification.input-dto';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { NotificationService } from '../application/notification.service';
import {
  NotificationOutputDto,
  NotificationWithUserIdOutputDto,
} from './dto/output-dto/notification.output.dto';
import { GetNotificationByIdQueryCommand } from '../application/query/get-notification-by-id.query.command';
import { CreateNotificationsUseCases } from '../application/use-cases/create-notifications.use-cases';
import { GetNotificationsByIdQueryCommand } from '../application/query/get-notifications-by-id.query.command';

@Controller()
export class NotificationController {
  constructor(
    private readonly logger: LoggerService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly notificationService: NotificationService,
  ) {
    this.logger.setContext(NotificationController.name);
  }

  @MessagePattern({ cmd: CREATE_NOTIFICATION })
  async createNotification(
    @Payload() payload: CreateNotificationInputDto,
  ): Promise<void> {
    this.logger.debug(
      'Execute: create notification',
      this.createNotification.name,
    );
    const result: AppNotificationResultType<string> =
      await this.commandBus.execute(
        new CreateNotificationUseCases(payload.userId, payload.message),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.createNotification.name);
        const notification: AppNotificationResultType<NotificationOutputDto> =
          await this.queryBus.execute(
            new GetNotificationByIdQueryCommand(result.data),
          );
        await this.notificationService.sendNewNotificationMessage(
          payload.userId,
          notification.data,
        );
        return;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.createNotification.name);
        return;
    }
  }

  @MessagePattern({ cmd: CREATE_NOTIFICATIONS })
  async createNotifications(
    @Payload() payload: CreateNotificationInputDto[],
  ): Promise<void> {
    this.logger.debug(
      'Execute: create notification',
      this.createNotification.name,
    );
    const result: AppNotificationResultType<string[]> =
      await this.commandBus.execute(new CreateNotificationsUseCases(payload));

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.createNotification.name);
        const notifications: AppNotificationResultType<
          NotificationWithUserIdOutputDto[]
        > = await this.queryBus.execute(
          new GetNotificationsByIdQueryCommand(result.data),
        );
        this.notificationService.sendManyNewNotificationMessage(
          notifications.data,
        );
        return;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.createNotification.name);
        return;
    }
  }
}
