import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';

import { PaymentsRepository } from '../../infrastructure/payments.repository';
import { CreatePaymentDto } from '../../api/dto/input-dto/create-payment.dto';
import { PaymentManager } from '../../../../common/managers/payment.manager';
import { PaymentTime } from '../../../../../../../libs/common/enums/payments';
import { PaymentData, UserInfo } from '../types/payment-data.type';

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
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly paymentManager: PaymentManager,
  ) {}

  async execute(command: CreatePaymentCommand) {
    const { typeSubscription, paymentSystem } = command.createSubscriptionDto;

    let price: number;

    if (typeSubscription === PaymentTime.DAY) {
      price = SUBSCRIPTION_PRICE * 100 * 1;
    }
    if (typeSubscription === PaymentTime.WEEKLY) {
      price = SUBSCRIPTION_PRICE * 100 * 7 * 0.93;
    }
    if (typeSubscription === PaymentTime.MONTHLY) {
      price = SUBSCRIPTION_PRICE * 100 * 30 * 0.75;
    }

    const paymentData: PaymentData = {
      successFrontendUrl: 'http://localhost:3000/subscriptions/success',
      cancelFrontendUrl: 'http://localhost:3000/subscriptions/cancel',
      productData: {
        name: 'Бизнесс аккаунт',
        description: 'c автопродлением',
      },
      price: price,
      paymentCount: 1,
      paymentSystem,
      typeSubscription,
      autoRenewal: true,
      userInfo: command.userInfo,
      orderId: null,
    };

    try {
      const newOrder = await this.paymentsRepository.createOrder({
        userId: command.userInfo.userId,
        subscriptionType: typeSubscription,
        price: price,
        paymentCount: paymentData.paymentCount,
        autoRenewal: paymentData.autoRenewal,
      });
      paymentData.orderId = newOrder.id;
      const newPayment =
        await this.paymentManager.createAutoPayment(paymentData);

      return { url: newPayment.url };
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException();
    }
  }
}
