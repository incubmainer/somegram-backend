import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { CreatePaymentDto } from '../../../api/dto/input-dto/create-payment.dto';
import { SubscriptionType } from '../../../../../../../../libs/common/enums/payments';
import { PaymentData, UserInfo } from '../../types/payment-data.type';
import { PaymentsService } from '../../../api/payments.service';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

const SUBSCRIPTION_PRICE = {
  day: 10,
  weekly: 50,
  monthly: 100,
}; //USD per day
export class CreatePaymentCommand {
  constructor(
    public userInfo: UserInfo,
    public createSubscriptionDto: CreatePaymentDto,
  ) {}
}

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentUseCase
  implements ICommandHandler<CreatePaymentCommand>
{
  configService = new ConfigService();
  successFrontendUrl = this.configService.get<string>(
    'FRONTEND_SUCCESS_PAYMENT_URL',
  );
  cancelFrontendUrl = this.configService.get<string>(
    'FRONTEND_CANCEL_PAYMENT_URL',
  );
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly paymentsService: PaymentsService,
    private readonly appNotification: ApplicationNotification,
  ) {}

  async execute(
    command: CreatePaymentCommand,
  ): Promise<AppNotificationResultType<string | null>> {
    const { subscriptionType, paymentSystem } = command.createSubscriptionDto;

    let price: number;

    if (subscriptionType === SubscriptionType.DAY) {
      price = SUBSCRIPTION_PRICE.day * 100;
    }
    if (subscriptionType === SubscriptionType.WEEKLY) {
      price = SUBSCRIPTION_PRICE.weekly * 100;
    }
    if (subscriptionType === SubscriptionType.MONTHLY) {
      price = SUBSCRIPTION_PRICE.monthly * 100;
    }

    const paymentData: PaymentData = {
      successFrontendUrl: this.successFrontendUrl,
      cancelFrontendUrl: this.cancelFrontendUrl,
      productData: {
        name: 'Бизнесс аккаунт',
        description: 'c автопродлением',
      },
      price,
      paymentCount: 1,
      paymentSystem,
      subscriptionType,
      userInfo: command.userInfo,
    };

    try {
      const subscriptionInfo =
        await this.paymentsRepository.getActiveSubscriptionByUserId(
          command.userInfo.userId,
        );

      if (
        subscriptionInfo &&
        (subscriptionInfo.autoRenewal === true ||
          subscriptionInfo.endDateOfSubscription > new Date())
      ) {
        paymentData.customerId = subscriptionInfo.paymentSystemCustomerId;
        await this.paymentsService.updateCurrentSub(paymentData);
        return this.appNotification.success(null);
      } else {
        const url = await this.paymentsService.createAutoPayment(paymentData);
        return this.appNotification.success(url);
      }
    } catch (e) {
      console.error(e);
      return this.appNotification.internalServerError();
    }
  }
}
