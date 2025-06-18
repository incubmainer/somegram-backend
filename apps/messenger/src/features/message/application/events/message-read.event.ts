import { EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { GetMessageByIdQuery } from '../query-bus/get-message-by-id.use-case';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { GetChatMessagesOutputDto } from '../../api/dto/output-dto/get-chat-messages.output.dto';
import { GatewayAdapter } from '../../../../common/adapters/gateway.adapter';

export class MessageReadEvent {
  constructor(
    public messageId: string,
    public participantId: string,
  ) {}
}

@EventsHandler(MessageReadEvent)
export class MessageReadEventHandler
  implements IEventHandler<MessageReadEvent>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly queryBus: QueryBus,
    private readonly gatewayAdapter: GatewayAdapter,
  ) {
    this.logger.setContext(MessageReadEventHandler.name);
  }
  async handle(event: MessageReadEvent): Promise<void> {
    this.logger.debug('Message was read event', this.handle.name);
    const { participantId, messageId } = event;
    try {
      const message: AppNotificationResultType<GetChatMessagesOutputDto> =
        await this.queryBus.execute(
          new GetMessageByIdQuery(messageId, participantId),
        );

      if (message.appResult !== AppNotificationResultEnum.Success) {
        this.logger.error(
          `Message was read event not published, something went wrong, message id: ${messageId}. App result status: ${message.appResult}`,
        );
        return;
      }

      this.gatewayAdapter.messageReadEvent({
        message: message.data,
        participantId,
      });
    } catch (e) {
      this.logger.debug(e, this.handle.name);
    }
  }
}
