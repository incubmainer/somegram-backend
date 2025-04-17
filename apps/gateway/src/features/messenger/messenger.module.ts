import { Module } from '@nestjs/common';
import { MessengerController } from './api/messenger.controller';

@Module({
  imports: [],
  controllers: [MessengerController],
  providers: [],
  exports: [],
})
export class MessengerModule {}
