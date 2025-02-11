import { Module } from '@nestjs/common';
import { NotificationWsGateway } from './api/notification.ws-gateway';
import { NotificationController } from './api/notification.controller';
import { NotificationEntity } from './domain/notification.entity';
import { CreateNotificationUseCaseHandler } from './application/use-cases/create-notification.use-cases';
import { NotificationRepository } from './infrastructure/notification.repository';
import { MarkNotificationAsReadUseCaseHandler } from './application/use-cases/mark-as-read.use-cases';
import { GetNotificationsByUserIdQueryCommandHandler } from './application/query/get-notifications.query.command';
import { NotificationOutputDtoMapper } from './api/dto/output-dto/notification.output.dto';
import { GetNotificationByIdQueryCommandHandler } from './application/query/get-notification-by-id.query.command';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { NotificationSwaggerController } from './api/swagger/notification-controller.swagger';
import { CreateNotificationsUseCaseHandler } from './application/use-cases/create-notifications.use-cases';
import { GetNotificationsByIdQueryCommandHandler } from './application/query/get-notifications-by-id.query.command';
import { CreatedNotificationEventHandler } from './application/event/created-notification.event';
import { CreatedNotificationsEventHandler } from './application/event/created-notifications.event';
import { PaymentsServiceAdapter } from '../../common/adapter/payment-service.adapter';
import { ClientsModule } from '@nestjs/microservices';
import { paymentsServiceOptions } from '../../settings/configuration/get-pyments-service.options';

const notificationEntityProvider = {
  provide: 'NotificationEntity',
  useValue: NotificationEntity,
};

@Module({
  imports: [
    UsersModule,
    ClientsModule.registerAsync([paymentsServiceOptions()]),
  ],
  controllers: [NotificationController, NotificationSwaggerController],
  providers: [
    NotificationWsGateway,
    notificationEntityProvider,
    CreateNotificationUseCaseHandler,
    CreateNotificationsUseCaseHandler,
    NotificationRepository,
    MarkNotificationAsReadUseCaseHandler,
    GetNotificationsByUserIdQueryCommandHandler,
    NotificationOutputDtoMapper,
    GetNotificationByIdQueryCommandHandler,
    GetNotificationsByIdQueryCommandHandler,
    JwtService,
    CreatedNotificationEventHandler,
    CreatedNotificationsEventHandler,
    PaymentsServiceAdapter,
  ],
  exports: [],
})
export class NotificationModule {}
