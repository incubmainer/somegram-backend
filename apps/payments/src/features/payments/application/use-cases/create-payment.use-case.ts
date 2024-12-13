import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

import { PaymentsRepository } from '../../infrastructure/payments.repository';
import { CreatePaymentDto } from '../../api/dto/input-dto/create-payment.dto';
import { SubscriptionType } from '../../../../../../../libs/common/enums/payments';
import { PaymentData, UserInfo } from '../types/payment-data.type';
import { PaymentsService } from '../../api/payments.service';
import { ApplicationNotification } from '@app/application-notification';

const SUBSCRIPTION_PRICE = 1; //USD per day
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

  async execute(command: CreatePaymentCommand) {
    const { subscriptionType, paymentSystem } = command.createSubscriptionDto;

    let price: number;

    if (subscriptionType === SubscriptionType.DAY) {
      price = SUBSCRIPTION_PRICE * 100 * 1;
    }
    if (subscriptionType === SubscriptionType.WEEKLY) {
      price = SUBSCRIPTION_PRICE * 100 * 7 * 0.93;
    }
    if (subscriptionType === SubscriptionType.MONTHLY) {
      price = SUBSCRIPTION_PRICE * 100 * 30 * 0.75;
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
        await this.paymentsRepository.getSubscriptionByUserId(
          command.userInfo.userId,
        );

      if (
        subscriptionInfo &&
        subscriptionInfo.status !== 'canceled' &&
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
