import { Module } from '@nestjs/common';
import { MessengerController } from './api/messenger.controller';
import { GetUserChatsOutputDtoMapper } from './api/dto/output-dto/get-user-chats.output.dto';
import { GetUserChatsQueryUseCase } from './application/query-bus/get-user-chats.use-case';
import { UsersModule } from '../users/users.module';
import { SendMessageUseCase } from './application/use-case/send-message.use-case';

const queryHandlers = [GetUserChatsQueryUseCase];

const handlers = [SendMessageUseCase];

@Module({
  imports: [UsersModule],
  controllers: [MessengerController],
  providers: [GetUserChatsOutputDtoMapper, ...queryHandlers, ...handlers],
  exports: [],
})
export class MessengerModule {}
