import { EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { NotificationOutputDto } from '../../api/dto/output-dto/notification.output.dto';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { GetNotificationByIdQueryCommand } from '../query/get-notification-by-id.query.command';
import { NotificationWsGateway } from '../../api/notification.ws-gateway';
import { WS_NEW_NOTIFICATION_EVENT } from '../../../../common/constants/ws-events.constants';

export class CreatedNotificationEvent {
  constructor(
    public notificationId: string,
    public userId: string,
  ) {}
}

@EventsHandler(CreatedNotificationEvent)
export class CreatedNotificationEventHandler
  implements IEventHandler<CreatedNotificationEvent>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly queryBus: QueryBus,
    private readonly notificationWsGateway: NotificationWsGateway,
  ) {
    this.logger.setContext(CreatedNotificationEventHandler.name);
  }
  async handle(event: CreatedNotificationEvent): Promise<void> {
    this.logger.debug('Publish new notification', this.handle.name);
    const { notificationId, userId } = event;
    try {
      await this.publishWs(notificationId, userId);
    } catch (e) {
      this.logger.debug(e, this.handle.name);
    }
  }

  private async publishWs(
    notificationId: string,
    userId: string,
  ): Promise<void> {
    const notification: AppNotificationResultType<NotificationOutputDto> =
      await this.queryBus.execute(
        new GetNotificationByIdQueryCommand(notificationId),
      );

    if (notification.appResult !== AppNotificationResultEnum.Success) {
      this.logger.error(
        `Notification was not published, something went wrong, notification id: ${notificationId}. App result status: ${notification.appResult}`,
        this.handle.name,
      );
      return;
    }

    this.notificationWsGateway.emitMessageByUserId(
      userId,
      WS_NEW_NOTIFICATION_EVENT,
      notification.data,
    );
  }
}
