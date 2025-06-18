import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { LoggerService } from '@app/logger';
import {
  WS_NEW_CHAT_MESSAGE_EVENT,
  WS_NEW_MESSAGE_EVENT,
} from '../../../../common/constants/ws-events.constants';
import {
  MessengerWsGateway,
  WS_CHAT_ROOM_NAME,
} from '../../api/messenger.ws-gateway';
import { ChatMessagesDto } from '../../domain/types';
import { MessengerService } from '../messenger.service';

export class NewMessageEvent {
  constructor(
    public message: ChatMessagesDto,
    public participantId: string,
  ) {}
}

@EventsHandler(NewMessageEvent)
export class NewMessageEventHandler implements IEventHandler<NewMessageEvent> {
  constructor(
    private readonly logger: LoggerService,
    private readonly messengerWsGateway: MessengerWsGateway,
    private readonly messengerService: MessengerService,
  ) {
    this.logger.setContext(NewMessageEventHandler.name);
  }
  async handle(event: NewMessageEvent): Promise<void> {
    this.logger.debug('Publish new message', this.handle.name);
    const { message, participantId } = event;

    const mappedMessage = await this.messengerService.handleMessage(message);

    try {
      this.messengerWsGateway.emitMessageByUserId(
        participantId,
        WS_NEW_MESSAGE_EVENT,
        mappedMessage,
      );
      this.messengerWsGateway.emitToRoom(
        WS_CHAT_ROOM_NAME,
        message.chatId,
        WS_NEW_CHAT_MESSAGE_EVENT,
        mappedMessage,
      );
      this.logger.debug('Success', this.handle.name);
    } catch (e) {
      this.logger.error(e, this.handle.name);
    }
  }
}
