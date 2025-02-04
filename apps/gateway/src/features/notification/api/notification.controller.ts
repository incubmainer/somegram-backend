import { Controller } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { CREATE_NOTIFICATION } from '../../../common/constants/service.constants';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateNotificationUseCases } from '../application/use-cases/create-notification.use-cases';
import { CreateNotificationInputDto } from './dto/input-dto/notification.input-dto';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { NotificationService } from '../application/notification.service';
import { NotificationOutputDto } from './dto/output-dto/notification.output.dto';
import { GetNotificationByIdQueryCommand } from '../application/query/get-notification-by-id.query.command';

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
}
