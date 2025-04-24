import { Module } from '@nestjs/common';
import { MessengerController } from './api/messenger.controller';
import { GetUserChatsOutputDtoMapper } from './api/dto/output-dto/get-user-chats.output.dto';
import { GetUserChatsQueryUseCase } from './application/query-bus/get-user-chats.use-case';
import { UsersModule } from '../users/users.module';
import { SendMessageUseCase } from './application/use-case/send-message.use-case';
import { GetChatMessagesQueryUseCase } from './application/query-bus/get-chat-messages.use-case';
import { ChatMessagesOutputDtoMapper } from './api/dto/output-dto/get-chat-messages.output.dto';
import { ReadMessageUseCase } from './application/use-case/read-message.use-case';

const queryHandlers = [GetUserChatsQueryUseCase, GetChatMessagesQueryUseCase];

const handlers = [SendMessageUseCase, ReadMessageUseCase];

@Module({
  imports: [UsersModule],
  controllers: [MessengerController],
  providers: [
    GetUserChatsOutputDtoMapper,
    ...queryHandlers,
    ...handlers,
    ChatMessagesOutputDtoMapper,
  ],
  exports: [],
})
export class MessengerModule {}
