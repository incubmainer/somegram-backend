import { Module } from '@nestjs/common';
import { NotificationWsGateway } from './api/notification.ws-gateway';
import { NotificationController } from './api/notification.controller';
import { NotificationEntity } from './domain/notification.entity';
import { CreateNotificationUseCaseHandler } from './application/use-cases/create-notification.use-cases';
import { NotificationRepository } from './infrastructure/notification.repository';
import { MarkNotificationAsReadUseCaseHandler } from './application/use-cases/mark-as-read.use-cases';
import { GetNotificationsByUserIdQueryCommandHandler } from './application/query/get-notification.query.command';
import { NotificationOutputDtoMapper } from './api/dto/output-dto/notification.output.dto';

const notificationEntityProvider = {
  provide: 'NotificationEntity',
  useValue: NotificationEntity,
};

@Module({
  imports: [],
  controllers: [NotificationController],
  providers: [
    NotificationWsGateway,
    notificationEntityProvider,
    CreateNotificationUseCaseHandler,
    NotificationRepository,
    MarkNotificationAsReadUseCaseHandler,
    GetNotificationsByUserIdQueryCommandHandler,
    NotificationOutputDtoMapper,
  ],
  exports: [],
})
export class NotificationModule {}
