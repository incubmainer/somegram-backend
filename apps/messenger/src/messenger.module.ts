import { Module } from '@nestjs/common';
import { AsyncLocalStorageService, LoggerModule } from '@app/logger';
import { CommonModule } from './common/common.module';
import { configModule } from './settings/configuration/config.module';

@Module({
  imports: [configModule, LoggerModule.forRoot('Messenger'), CommonModule],
  controllers: [],
  providers: [AsyncLocalStorageService],
})
export class MessengerModule {}
