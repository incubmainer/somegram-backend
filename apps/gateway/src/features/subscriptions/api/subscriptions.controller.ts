import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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

  @Post('canceled-auto-renewal')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async canceledAutoRenewal(@CurrentUserId() userId: string) {
    // const result: NotificationObject<string, ValidationError> =
    //   await this.commandBus.execute();
    // const code = result.getCode();
    // if (code === CreatePaymentCodes.Success) {
    //   return true;
    // }н
  }
}
