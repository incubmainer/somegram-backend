import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
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
import { CreateSubscriptionDto } from './dto/input-dto/subscriptions.dto';
import { PaymentsServiceAdapter } from '../../../common/adapter/payment-service.adapter';
import { CreateSubscriptionSwagger } from './swagger/create-subscription.swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateSubscriptionInfoCommand } from '../application/use-cases/update-subscription-info.use-case';
import { SEND_SUBSCRIPTION_INFO } from '../../../common/constants/service.constants';
import { LoggerService } from '@app/logger';
import { SUBSCRIPTIONS_ROUTE } from '../../../common/constants/route.constants';
import { EnableAutoRenewalSwagger } from './swagger/enable-autorenewal.swagger';
import { DisableAutoRenewalSwagger } from './swagger/disable-autorenewal.swagger';
import { MyPaymentsSwagger } from './swagger/my-payments.swagger';
import {
  MyPaymentsOutputDto,
  SubscriptionInfoOutputDto,
} from './dto/output-dto/subscriptions.output-dto';
import { SubscriptionInfoSwagger } from './swagger/subscription-info.swagger';
import { SearchQueryParametersType } from '../../../common/domain/query.types';
import { Paginator } from '../../../common/domain/paginator';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';

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
  async geyPayments(
    @CurrentUserId() userId: string,
    @Query() queryString?: SearchQueryParametersType,
  ): Promise<Paginator<MyPaymentsOutputDto[]>> {
    const result: AppNotificationResultType<Paginator<MyPaymentsOutputDto[]>> =
      await this.paymentsServiceAdapter.getPayments({
        userId,
        queryString,
      });

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.geyPayments.name);
        return result.data;
      default:
        throw new InternalServerErrorException();
    }
  }

  @Get(SUBSCRIPTIONS_ROUTE.INFO)
  @SubscriptionInfoSwagger()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async geySubscriptionInfo(
    @CurrentUserId() userId: string,
  ): Promise<SubscriptionInfoOutputDto> {
    const result: AppNotificationResultType<SubscriptionInfoOutputDto> =
      await this.paymentsServiceAdapter.getSubscriptionInfo({
        userId,
      });

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug(`Success`, this.geySubscriptionInfo.name);
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
        this.logger.debug(`Not found`, this.disableAutoRenewal.name);
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
        this.logger.debug(`Not found`, this.enableAutoRenewal.name);
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

  // TODO Не приходят хуки возможно проблема с paypal проверить завтра
  @Post(SUBSCRIPTIONS_ROUTE.PAYPAL_WEBHOOK)
  @HttpCode(200)
  @ApiExcludeEndpoint()
  async paypalWebhook(@Req() req: RawBodyRequest<Request>): Promise<void> {
    this.logger.debug('Execute: paypal webhook', this.paypalWebhook.name);
    const rawBody: Buffer = req.rawBody;
    const headers: Headers = req.headers;

    const result: AppNotificationResultType<null> =
      await this.paymentsServiceAdapter.paypalWebhook({
        rawBody,
        headers,
      });

    switch (result.appResult) {
      case AppNotificationResultEnum.Success:
        this.logger.debug('Success', this.paypalWebhook.name);
        return;
      case AppNotificationResultEnum.Forbidden:
        this.logger.debug('Forbidden', this.paypalWebhook.name);
        throw new ForbiddenException();
      default:
        throw new InternalServerErrorException();
    }
  }
}
