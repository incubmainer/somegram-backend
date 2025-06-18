import { EventsHandler, IEventHandler, QueryBus } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { GetMessageByIdQuery } from '../query-bus/get-message-by-id.use-case';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { GetChatMessagesOutputDto } from '../../api/dto/output-dto/get-chat-messages.output.dto';
import { GatewayAdapter } from '../../../../common/adapters/gateway.adapter';

export class NewMessageEvent {
  constructor(
    public messageId: string,
    public participantId: string,
  ) {}
}

@EventsHandler(NewMessageEvent)
export class NewMessageEventHandler implements IEventHandler<NewMessageEvent> {
  constructor(
    private readonly logger: LoggerService,
    private readonly queryBus: QueryBus,
    private readonly gatewayAdapter: GatewayAdapter,
  ) {
    this.logger.setContext(NewMessageEventHandler.name);
  }
  async handle(event: NewMessageEvent): Promise<void> {
    this.logger.debug('Publish new message', this.handle.name);
    const { participantId, messageId } = event;
    try {
      const message: AppNotificationResultType<GetChatMessagesOutputDto> =
        await this.queryBus.execute(
          new GetMessageByIdQuery(messageId, participantId),
        );

      if (message.appResult !== AppNotificationResultEnum.Success) {
        this.logger.error(
          `New message was not published, something went wrong, message id: ${messageId}. App result status: ${message.appResult}`,
        );
        return;
      }

      this.gatewayAdapter.newMessageEvent({
        message: message.data,
        participantId,
      });
    } catch (e) {
      this.logger.debug(e, this.handle.name);
    }
  }
}
