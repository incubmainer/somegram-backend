import { Module } from '@nestjs/common';
import { ChatQueryRepository } from './infrastructure/chat.query-repository';
import { GetAllChatsForUserUseCase } from './application/query-bus/get-all-chats-for-for-user.use-case';
import { ChatController } from './api/chat.controller';
import { UserChatOutputDtoMapper } from './api/dto/output-dto/get-all-user-chats.output.dto';
import { ChatRepository } from './infrastructure/chat.repository';

const queryHandlers = [GetAllChatsForUserUseCase];

@Module({
  imports: [],
  controllers: [ChatController],
  providers: [
    ChatQueryRepository,
    ChatRepository,
    ...queryHandlers,
    UserChatOutputDtoMapper,
  ],
  exports: [ChatRepository],
})
export class ChatModule {}
