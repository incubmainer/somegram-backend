import { Module } from '@nestjs/common';
import { ChatQueryRepository } from './infrastructure/chat.query-repository';
import { GetAllChatsForUserUseCase } from './application/query-bus/get-all-chats-for-for-user.use-case';
import { ChatController } from './api/chat.controller';
import { UserChatOutputDtoMapper } from './api/dto/output-dto/get-all-user-chats.output.dto';
import { ChatRepository } from './infrastructure/chat.repository';
import { GetChatByIdQueryUseCase } from './application/query-bus/get-chat-by-id.use-case';
import { ChatOutputDtoMapper } from './api/dto/output-dto/get-chat-by-id.output.dto';

const queryHandlers = [GetAllChatsForUserUseCase, GetChatByIdQueryUseCase];

@Module({
  imports: [],
  controllers: [ChatController],
  providers: [
    ChatQueryRepository,
    ChatRepository,
    ...queryHandlers,
    UserChatOutputDtoMapper,
    ChatOutputDtoMapper,
  ],
  exports: [ChatRepository, ChatQueryRepository],
})
export class ChatModule {}
