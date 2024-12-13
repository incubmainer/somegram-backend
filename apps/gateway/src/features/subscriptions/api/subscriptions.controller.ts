import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/api/decorators/current-user-id-param.decorator';
import { CreatePaymentCommand } from '../application/use-cases/create-payments.use-case';
import { CreateSubscriptionDto } from './dto/input-dto/create-subscription.dto';
import { PaymentsServiceAdapter } from '../../../common/adapter/payment-service.adapter';
import { CreateSubscriptionSwagger } from './swagger/create-subscription.swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateSubscriptionInfoCommand } from '../application/use-cases/update-subscription-info.use-case';
import { SEND_SUBSCRIPTION_INFO } from '../../../common/constants/service.constants';
import { LoggerService } from '@app/logger';
import { SUBSCRIPTIONS_ROUTE } from '../../../common/constants/route.constants';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { EnableAutoRenewalSwagger } from './swagger/enable-autorenewal.swagger';
import { DisableAutoRenewalSwagger } from './swagger/disable-autorenewal.swagger';
import { MyPaymentsSwagger } from './swagger/my-payments.swagger';

@ApiTags('Subscriptions')
@Controller(SUBSCRIPTIONS_ROUTE.MAIN)
export class SubscriptionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly paymentsServiceAdapter: PaymentsServiceAdapter,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(SubscriptionsController.name);
  }

  @Post(SUBSCRIPTIONS_ROUTE.CREATE_PAYMENT)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBearerAuth('access-token')
  @CreateSubscriptionSwagger()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createSubscription(
    @CurrentUserId() userId: string,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    const result: AppNotificationResultType<{ url: string } | null> =
      await this.commandBus.execute(
        new CreatePaymentCommand(userId, createSubscriptionDto),
      );
    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.createSubscription.name);
        return result.data;
      default:
        throw new InternalServerErrorException();
    }
  }

  @Get(SUBSCRIPTIONS_ROUTE.MY_PAYMENTS)
  @MyPaymentsSwagger()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async geyPayments(@CurrentUserId() userId: string): Promise<void> {
    const result: AppNotificationResultType<any> =
      await this.paymentsServiceAdapter.getPayments({
        userId,
      });

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.createSubscription.name);
        return result.data;
      default:
        throw new InternalServerErrorException();
    }
  }

  @Post(SUBSCRIPTIONS_ROUTE.STRIPE_WEBHOOK)
  @ApiExcludeEndpoint()
  async stripeWebhook(@Req() req: RawBodyRequest<Request>): Promise<void> {
    const rawBody = req.rawBody;
    const signatureHeader = req.headers['stripe-signature'] as string;
    return await this.paymentsServiceAdapter.stripeWebhook({
      rawBody,
      signatureHeader,
    });
  }

  @Post(SUBSCRIPTIONS_ROUTE.DISABLE_AUTO_RENEWAL)
  @DisableAutoRenewalSwagger()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async disableAutoRenewal(@CurrentUserId() userId: string) {
    const result: AppNotificationResultType<any> =
      await this.paymentsServiceAdapter.disableAutoRenewal({
        userId,
      });

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.disableAutoRenewal.name);
        return result.data;
      case AppNotificationResultEnum.NotFound:
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @Post(SUBSCRIPTIONS_ROUTE.ENABLE_AUTO_RENEWAL)
  @EnableAutoRenewalSwagger()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async enableAutoRenewal(@CurrentUserId() userId: string) {
    const result: AppNotificationResultType<any> =
      await this.paymentsServiceAdapter.enableAutoRenewal({
        userId,
      });

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.enableAutoRenewal.name);
        return result.data;
      case AppNotificationResultEnum.NotFound:
        throw new NotFoundException();
      default:
        throw new InternalServerErrorException();
    }
  }

  @MessagePattern({ cmd: SEND_SUBSCRIPTION_INFO })
  async sendSubscriptionInfo(@Payload() { payload }) {
    console.log(payload);
    return await this.commandBus.execute(
      new UpdateSubscriptionInfoCommand(payload),
    );
  }
}
