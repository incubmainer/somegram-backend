import { Module } from '@nestjs/common';
import { MessageController } from './api/message.controller';
import { SendMessageUseCase } from './application/use-case/send-message.use-case';
import { MessageRepository } from './infrastructure/message.repository';
import { ChatModule } from '../chat/chat.module';
import { GetChatMessagesUseCase } from './application/query-bus/get-chat-messages.use-case';
import { MessageQueryRepository } from './infrastructure/message.query-repository';
import { GetChatMessagesOutputDtoMapper } from './api/dto/output-dto/get-chat-messages.output.dto';
import { ReadMessageUseCase } from './application/use-case/read-message.use-case';

const handlers = [SendMessageUseCase, ReadMessageUseCase];
const queryHandlers = [GetChatMessagesUseCase];

@Module({
  imports: [ChatModule],
  controllers: [MessageController],
  providers: [
    ...handlers,
    ...queryHandlers,
    MessageRepository,
    MessageQueryRepository,
    GetChatMessagesOutputDtoMapper,
  ],
  exports: [],
})
export class MessageModule {}
