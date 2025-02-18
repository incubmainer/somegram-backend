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
import { ConfigService } from '@nestjs/config';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { ConfigurationType } from '../../settings/configuration/configuration';
import { EmailAdapter, EmailAdapterMock } from './infrastructure/email.adapter';
import { LoggerService } from '@app/logger';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { SendEmailNotificationSubscriptionActivatedEventHandler } from './application/event/send-email-notification-subscription-activated.event';
import { SendEmailNotificationSubscriptionDisabledEventHandler } from './application/event/send-email-notification-subscription-disabled.event';

const notificationEntityProvider = {
  provide: 'NotificationEntity',
  useValue: NotificationEntity,
};

const emailAdapter = {
  provide: EmailAdapter,
  useFactory: (
    configService: ConfigService<ConfigurationType, true>,
    mailerService: MailerService,
    logger: LoggerService,
  ): EmailAdapterMock | EmailAdapter => {
    const env = configService.get('envSettings', { infer: true });

    return env.isTestingState() || env.isDevelopmentState()
      ? new EmailAdapterMock(logger, mailerService, configService)
      : new EmailAdapter(logger, mailerService, configService);
  },
  inject: [ConfigService, MailerService, LoggerService],
};

const mailerModule = MailerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService<ConfigurationType, true>) => {
    return {
      transport: {
        service: configService.get('envSettings', { infer: true })
          .EMAIL_SERVICE,
        secure: false,
        port: 465,
        auth: {
          user: configService.get('envSettings', { infer: true }).EMAIL_USER,
          pass: configService.get('envSettings', { infer: true })
            .EMAIL_PASSWORD,
          service: configService.get('envSettings', { infer: true })
            .EMAIL_SERVICE,
        },
      },
      template: {
        dir: __dirname + '/features/notification/email-templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    };
  },
});

@Module({
  imports: [
    UsersModule,
    ClientsModule.registerAsync([paymentsServiceOptions()]),
    mailerModule,
  ],
  controllers: [NotificationController, NotificationSwaggerController],
  providers: [
    emailAdapter,
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
    SendEmailNotificationSubscriptionActivatedEventHandler,
    SendEmailNotificationSubscriptionDisabledEventHandler,
  ],
  exports: [SendEmailNotificationSubscriptionActivatedEventHandler],
})
export class NotificationModule {}
