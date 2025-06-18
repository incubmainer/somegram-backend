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
import { PhotoServiceAdapter } from '../../../../common/adapter/photo-service.adapter';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { ChatMessagesOutputDtoMapper } from '../../api/dto/output-dto/get-chat-messages.output.dto';

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
    private readonly photoServiceAdapter: PhotoServiceAdapter,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly chatMessagesOutputDtoMapper: ChatMessagesOutputDtoMapper,
  ) {
    this.logger.setContext(NewMessageEventHandler.name);
  }
  async handle(event: NewMessageEvent): Promise<void> {
    this.logger.debug('Publish new message', this.handle.name);
    const { message, participantId } = event;

    const userIds = [message.senderId];

    const avatar = await this.photoServiceAdapter.getUsersAvatar(userIds);
    const senderInfo =
      await this.usersQueryRepository.getUsersAndUsersIsBan(userIds);

    const mappedMessage = this.chatMessagesOutputDtoMapper.mapMessage(
      message,
      avatar,
      senderInfo,
    );

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
