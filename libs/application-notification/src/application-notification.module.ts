import { Global, Module } from '@nestjs/common';
import { ApplicationNotification } from './application-notification.service';
import { WsNotification } from '@app/application-notification/ws-notification.service';

@Global()
@Module({
  providers: [ApplicationNotification, WsNotification],
  exports: [ApplicationNotification, WsNotification],
})
export class ApplicationNotificationModule {}
