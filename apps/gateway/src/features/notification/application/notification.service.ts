import { NotificationWsGateway } from '../api/notification.ws-gateway';
import { Injectable } from '@nestjs/common';
import { WS_NEW_NOTIFICATION_EVENT } from '../../../common/constants/ws-events.constants';
import { LoggerService } from '@app/logger';
import { NotificationOutputDto } from '../api/dto/output-dto/notification.output.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly logger: LoggerService,
    private readonly notificationWsGateway: NotificationWsGateway,
  ) {
    this.logger.setContext(NotificationService.name);
  }

  async sendNewNotificationMessage(
    userId: string,
    notification: NotificationOutputDto,
  ): Promise<void> {
    this.notificationWsGateway.emitMessageByUserId(
      userId,
      WS_NEW_NOTIFICATION_EVENT,
      notification,
    );
  }
}
