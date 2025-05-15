import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import { WS_MESSAGE_READ_EVENT } from '../../../../common/constants/ws-events.constants';
import {
  MessengerWsGateway,
  WS_CHAT_ROOM_NAME,
} from '../../api/messenger.ws-gateway';
import { ChatMessagesDto } from '../../domain/types';

export class MessageReadEvent {
  constructor(public message: ChatMessagesDto) {}
}

@EventsHandler(MessageReadEvent)
export class MessageReadEventHandler
  implements IEventHandler<MessageReadEvent>
{
  constructor(
    private readonly logger: LoggerService,
    private readonly messengerWsGateway: MessengerWsGateway,
  ) {
    this.logger.setContext(MessageReadEventHandler.name);
  }
  async handle(event: MessageReadEvent): Promise<void> {
    this.logger.debug('Publish message read notification', this.handle.name);
    const { message } = event;
    try {
      this.messengerWsGateway.emitToRoom(
        WS_CHAT_ROOM_NAME,
        message.chatId,
        WS_MESSAGE_READ_EVENT,
        message,
      );
      this.logger.debug('Success', this.handle.name);
    } catch (e) {
      this.logger.error(e, this.handle.name);
    }
  }
}
