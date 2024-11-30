import { Global, Module } from '@nestjs/common';
import { ApplicationNotification } from './application-notification.service';

@Global()
@Module({
  providers: [ApplicationNotification],
  exports: [ApplicationNotification],
})
export class ApplicationNotificationModule {}
