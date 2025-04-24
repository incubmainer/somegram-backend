import { Module } from '@nestjs/common';
import { MessageController } from './api/message.controller';
import { SendMessageUseCase } from './application/use-case/send-message.use-case';
import { MessageRepository } from './infrastructure/message.repository';
import { ChatModule } from '../chat/chat.module';
import { GetChatMessagesUseCase } from './application/query-bus/get-chat-messages.use-case';
import { MessageQueryRepository } from './infrastructure/message.query-repository';
import { GetChatMessagesOutputDtoMapper } from './api/dto/output-dto/get-chat-messages.output.dto';
import { ReadMessageUseCase } from './application/use-case/read-message.use-case';
import { GetMessageByIdUseCase } from './application/query-bus/get-message-by-id.use-case';
import { NewMessageEventHandler } from './application/events/new-message.event';
import { SendMessageOutputDtoMapper } from './api/dto/output-dto/send-message.output.dto';

const handlers = [SendMessageUseCase, ReadMessageUseCase];
const queryHandlers = [GetChatMessagesUseCase, GetMessageByIdUseCase];
const events = [NewMessageEventHandler];

@Module({
  imports: [ChatModule],
  controllers: [MessageController],
  providers: [
    ...handlers,
    ...queryHandlers,
    ...events,
    MessageRepository,
    MessageQueryRepository,
    GetChatMessagesOutputDtoMapper,
    SendMessageOutputDtoMapper,
  ],
  exports: [],
})
export class MessageModule {}
