import {
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@app/logger';
import {
  CREATE_NOTIFICATION,
  CREATE_NOTIFICATIONS,
} from '../../../common/constants/service.constants';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateNotificationUseCases } from '../application/use-cases/create-notification.use-cases';
import { CreateNotificationInputDto } from './dto/input-dto/notification.input-dto';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { NotificationOutputDto } from './dto/output-dto/notification.output.dto';
import { CreateNotificationsUseCases } from '../application/use-cases/create-notifications.use-cases';
import { GetNotificationsByUserIdQueryCommand } from '../application/query/get-notifications.query.command';
import { NOTIFICATION_ROUTE } from '../../../common/constants/route.constants';
import { CurrentUserId } from '../../auth/api/decorators/current-user-id-param.decorator';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GetNotificationsSwagger } from './swagger/get-notifications.swagger';
import { MarkNotificationAsReadUseCases } from '../application/use-cases/mark-as-read.use-cases';
import { ReadNotificationByIdSwagger } from './swagger/read-notification-by-id.swagger';
import { PaymentsServiceAdapter } from '../../../common/adapter/payment-service.adapter';
import { TestingSendNotificationSwagger } from './swagger/testing-send-notification.swagger';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@Controller(NOTIFICATION_ROUTE.MAIN)
export class NotificationController {
  constructor(
    private readonly logger: LoggerService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly paymentsServiceAdapter: PaymentsServiceAdapter,
  ) {
    this.logger.setContext(NotificationController.name);
  }

  @ApiExcludeEndpoint()
  @MessagePattern({ cmd: CREATE_NOTIFICATION })
  async createNotification(
    @Payload() payload: CreateNotificationInputDto,
  ): Promise<void> {
    this.logger.debug(
      'Execute: create notification',
      this.createNotification.name,
    );
    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(
        new CreateNotificationUseCases(payload.userId, payload.message),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.createNotification.name);
        return;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.createNotification.name);
        return;
    }
  }

  @ApiExcludeEndpoint()
  @MessagePattern({ cmd: CREATE_NOTIFICATIONS })
  async createNotifications(
    @Payload() payload: CreateNotificationInputDto[],
  ): Promise<void> {
    this.logger.debug(
      'Execute: create many notifications',
      this.createNotifications.name,
    );
    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(new CreateNotificationsUseCases(payload));

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.createNotifications.name);
        return;
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not found', this.createNotifications.name);
        return;
    }
  }

  @GetNotificationsSwagger()
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getNotifications(
    @CurrentUserId() userId: string,
  ): Promise<NotificationOutputDto[]> {
    const result: AppNotificationResultType<NotificationOutputDto[]> =
      await this.queryBus.execute(
        new GetNotificationsByUserIdQueryCommand(userId),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.getNotifications.name);
        return result.data;
      default:
        throw new InternalServerErrorException();
    }
  }

  @ReadNotificationByIdSwagger()
  @Put(`${NOTIFICATION_ROUTE.MARK_AS_READ}/:notificationId`)
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  async readNotification(
    @CurrentUserId() userId: string,
    @Param('notificationId') notificationId: string,
  ): Promise<void> {
    const result: AppNotificationResultType<null> =
      await this.commandBus.execute(
        new MarkNotificationAsReadUseCases(userId, notificationId),
      );

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.readNotification.name);
        return;
      case AppNotificationResultEnum.Forbidden:
        this.logger.debug('Forbidden', this.readNotification.name);
        throw new ForbiddenException();
      case AppNotificationResultEnum.NotFound:
        this.logger.debug('Not Found', this.readNotification.name);
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Get(NOTIFICATION_ROUTE.TESTING)
  @TestingSendNotificationSwagger()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'))
  async testingSendNotification(
    @CurrentUserId() userId: string,
  ): Promise<null> {
    this.logger.debug(
      `Execute: send notification (Testing)`,
      this.testingSendNotification.name,
    );

    const result: AppNotificationResultType<null> =
      await this.paymentsServiceAdapter.testingSendNotification({ userId });

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.testingSendNotification.name);
        return result.data;
      default:
        throw new InternalServerErrorException();
    }
  }
}
