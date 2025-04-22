import { Module } from '@nestjs/common';
import { MessageController } from './api/message.controller';
import { SendMessageUseCase } from './application/use-case/send-message.use-case';
import { MessageRepository } from './infrastructure/message.repository';
import { ChatModule } from '../chat/chat.module';

const handlers = [SendMessageUseCase];

@Module({
  imports: [ChatModule],
  controllers: [MessageController],
  providers: [...handlers, MessageRepository],
  exports: [],
})
export class MessageModule {}
