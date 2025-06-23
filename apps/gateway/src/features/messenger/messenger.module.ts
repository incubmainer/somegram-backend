import { Module } from '@nestjs/common';
import { MessengerController } from './api/messenger.controller';
import { GetUserChatsOutputDtoMapper } from './api/dto/output-dto/get-user-chats.output.dto';
import { GetUserChatsQueryUseCase } from './application/query-bus/get-user-chats.use-case';
import { UsersModule } from '../users/users.module';
import { SendMessageUseCase } from './application/use-case/send-message.use-case';
import { GetChatMessagesQueryUseCase } from './application/query-bus/get-chat-messages.use-case';
import { ChatMessagesOutputDtoMapper } from './api/dto/output-dto/get-chat-messages.output.dto';
import { ReadMessageUseCase } from './application/use-case/read-message.use-case';
import { MessengerWsGateway } from './api/messenger.ws-gateway';
import { NewMessageEventHandler } from './application/events/new-message.event';
import { GetChatByIdQueryUseCase } from './application/query-bus/get-chat-by-id.use-case';
import { MessengerSwaggerController } from './api/swagger/messanger-controller.swagger';
import { MessageReadEventHandler } from './application/events/message-read.event';
import { RemoveMessagesUseCase } from './application/use-case/remove-messages.use-case';
import { GetMessageByIdQueryUseCase } from './application/query-bus/get-message-by-id.use-case';
import { MessengerService } from './application/messenger.service';

const queryHandlers = [
  GetUserChatsQueryUseCase,
  GetChatMessagesQueryUseCase,
  GetChatByIdQueryUseCase,
  GetMessageByIdQueryUseCase,
];

const handlers = [
  SendMessageUseCase,
  ReadMessageUseCase,
  RemoveMessagesUseCase,
];

const events = [NewMessageEventHandler, MessageReadEventHandler];

@Module({
  imports: [UsersModule],
  controllers: [MessengerController, MessengerSwaggerController],
  providers: [
    GetUserChatsOutputDtoMapper,
    ...queryHandlers,
    ...handlers,
    ...events,
    ChatMessagesOutputDtoMapper,
    MessengerWsGateway,
    MessengerService,
  ],
  exports: [],
})
export class MessengerModule {}
