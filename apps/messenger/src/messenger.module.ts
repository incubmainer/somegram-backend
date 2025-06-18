import { Module } from '@nestjs/common';
import { AsyncLocalStorageService, LoggerModule } from '@app/logger';
import { CommonModule } from './common/common.module';
import { configModule } from './settings/configuration/config.module';
import { ChatModule } from './features/chat/chat.module';
import { MessageModule } from './features/message/message.module';

@Module({
  imports: [
    configModule,
    LoggerModule.forRoot('Messenger'),
    CommonModule,
    ChatModule,
    MessageModule,
  ],
  controllers: [],
  providers: [AsyncLocalStorageService],
})
export class MessengerModule {}
