import { Module } from '@nestjs/common';
import { NotificationWsGateway } from './api/notification.ws-gateway';
import { NotificationController } from './api/notification.controller';
import { NotificationEntity } from './domain/notification.entity';
import { CreateNotificationUseCaseHandler } from './application/use-cases/create-notification.use-cases';
import { NotificationRepository } from './infrastructure/notification.repository';
import { MarkNotificationAsReadUseCaseHandler } from './application/use-cases/mark-as-read.use-cases';
import { GetNotificationsByUserIdQueryCommandHandler } from './application/query/get-notifications.query.command';
import { NotificationOutputDtoMapper } from './api/dto/output-dto/notification.output.dto';
import { NotificationService } from './application/notification.service';
import { GetNotificationByIdQueryCommandHandler } from './application/query/get-notification-by-id.query.command';
import { JwtService } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { NotificationSwaggerController } from './api/swagger/notification-controller.swagger';

const notificationEntityProvider = {
  provide: 'NotificationEntity',
  useValue: NotificationEntity,
};

@Module({
  imports: [UsersModule],
  controllers: [NotificationController, NotificationSwaggerController],
  providers: [
    NotificationService,
    NotificationWsGateway,
    notificationEntityProvider,
    CreateNotificationUseCaseHandler,
    NotificationRepository,
    MarkNotificationAsReadUseCaseHandler,
    GetNotificationsByUserIdQueryCommandHandler,
    NotificationOutputDtoMapper,
    GetNotificationByIdQueryCommandHandler,
    JwtService,
  ],
  exports: [],
})
export class NotificationModule {}
