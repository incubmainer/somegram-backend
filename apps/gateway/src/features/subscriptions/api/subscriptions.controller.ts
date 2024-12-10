import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/api/decorators/current-user-id-param.decorator';
import { ValidationError } from 'class-validator';
import {
  CreatePaymentCodes,
  CreatePaymentCommand,
} from '../application/use-cases/create-payments.use-case';
import { CreateSubscriptionDto } from './dto/input-dto/create-subscription.dto';
import { NotificationObject } from '../../../common/domain/notification';
import { PaymentsServiceAdapter } from '../../../common/adapter/payment-service.adapter';
import { CreateSubscriptionSwagger } from './swagger/create-subscription.swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdateSubscriptionInfoCommand } from '../application/use-cases/update-subscription-info.use-case';
import { SEND_SUBSCRIPTION_INFO } from '../../../common/constants/service.constants';

@ApiTags('Subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly paymentsServiceAdapter: PaymentsServiceAdapter,
  ) {}

  @Get('success')
  @ApiExcludeEndpoint()
  async successPayment() {
    console.log('success');
    return 'success';
  }
  @Get('cancel')
  @ApiExcludeEndpoint()
  async cancelPayment() {
    console.log('cancel');
    return 'cancel';
  }

  @Post('create-payment')
  @CreateSubscriptionSwagger()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createSubscription(
    @CurrentUserId() userId: string,
    @Body() createSubscriptionDto: CreateSubscriptionDto,
  ) {
    const result: NotificationObject<string, ValidationError> =
      await this.commandBus.execute(
        new CreatePaymentCommand(userId, createSubscriptionDto),
      );

    const code = result.getCode();
    if (code === CreatePaymentCodes.Success) {
      const url = result.getData();
      return url;
    }
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async geyPayments(@CurrentUserId() userId: string): Promise<void> {
    return await this.paymentsServiceAdapter.getPayments({
      userId,
    });
  }

  @Post('stripe-webhook')
  @ApiExcludeEndpoint()
  async stripeWebhook(@Req() req: RawBodyRequest<Request>): Promise<void> {
    const rawBody = req.rawBody;
    const signatureHeader = req.headers['stripe-signature'] as string;
    return await this.paymentsServiceAdapter.stripeWebhook({
      rawBody,
      signatureHeader,
    });
  }

  @Post('disable-auto-renewal')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async disableAutoRenewal(@CurrentUserId() userId: string) {
    const result = await this.paymentsServiceAdapter.disableAutoRenewal({
      userId,
    });
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @Post('enable-auto-renewal')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async enableAutoRenewal(@CurrentUserId() userId: string) {
    const result = await this.paymentsServiceAdapter.enableAutoRenewal({
      userId,
    });
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }

  @MessagePattern({ cmd: SEND_SUBSCRIPTION_INFO })
  async sendSubscriptionInfo(@Payload() { payload }) {
    return await this.commandBus.execute(
      new UpdateSubscriptionInfoCommand(payload),
    );
  }
}
