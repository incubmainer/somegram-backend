import { EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { NotificationWithUserIdOutputDto } from '../../api/dto/output-dto/notification.output.dto';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { NotificationWsGateway } from '../../api/notification.ws-gateway';
import { WS_NEW_NOTIFICATION_EVENT } from '../../../../common/constants/ws-events.constants';
import { GetNotificationsByIdQueryCommand } from '../query/get-notifications-by-id.query.command';

export class CreatedNotificationsEvent {
  constructor(public notificationIds: string[]) {}
}

@EventsHandler(CreatedNotificationsEvent)
export class CreatedNotificationsEventHandler
  implements IEventHandler<CreatedNotificationsEvent>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly queryBus: QueryBus,
    private readonly notificationWsGateway: NotificationWsGateway,
  ) {
    this.logger.setContext(CreatedNotificationsEventHandler.name);
  }
  async handle(event: CreatedNotificationsEvent): Promise<void> {
    this.logger.debug('Publish new notifications', this.handle.name);
    const { notificationIds } = event;
    try {
      await this.publishWs(notificationIds);
    } catch (e) {
      this.logger.debug(e, this.handle.name);
    }
  }

  private async publishWs(notificationIds: string[]): Promise<void> {
    const notifications: AppNotificationResultType<
      NotificationWithUserIdOutputDto[]
    > = await this.queryBus.execute(
      new GetNotificationsByIdQueryCommand(notificationIds),
    );

    if (notifications.appResult !== AppNotificationResultEnum.Success) {
      this.logger.error(
        `Notifications was not published, something went wrong, notification ids: ${notificationIds}. App result status: ${notifications.appResult}`,
        this.handle.name,
      );
      return;
    }

    notifications.data.forEach(
      (notification: NotificationWithUserIdOutputDto) =>
        this.notificationWsGateway.emitMessageByUserId(
          notification.userId,
          WS_NEW_NOTIFICATION_EVENT,
          notification.dto,
        ),
    );
  }
}
