import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';

import { PaymentsRepository } from '../../infrastructure/payments.repository';
import { CreatePaymentDto } from '../../api/dto/input-dto/create-payment.dto';
import { PaymentManager } from '../../../../common/managers/payment.manager';
import { PaymentTime } from '../../../../../../../libs/common/enums/payments';
import { TransactionStatuses } from '../../../../common/enum/transaction-statuses.enum';
import { PaymentData } from '../types/payment-data.type';

const SUBSCRIPTION_PRICE = 1; //USD per day

export class CreatePaymentCommand {
  constructor(
    public userId: string,
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
    const { typeSubscription, paymentSystem, paymentCount, autoRenewal } =
      command.createSubscriptionDto;

    let totalPrice: number;
    let paymentCountDays: number;
    if (typeSubscription === PaymentTime.DAY) {
      paymentCountDays = 1 * paymentCount;
      totalPrice = SUBSCRIPTION_PRICE * 100 * 1;
    }
    if (typeSubscription === PaymentTime.WEEKLY) {
      paymentCountDays = 7 * paymentCount;
      totalPrice = SUBSCRIPTION_PRICE * 100 * 7;
    }
    if (typeSubscription === PaymentTime.MONTHLY) {
      paymentCountDays = 30 * paymentCount;
      totalPrice = SUBSCRIPTION_PRICE * 100 * 30;
    }

    // const currentDate = new Date();
    // const subscriptionValidUntilDate = currentDate.setDate(
    //   currentDate.getDate() + paymentCountDays,
    // );
    const paymentData: PaymentData = {
      successFrontendUrl: 'http://localhost:3000/subscriptions/success',
      cancelFrontendUrl: 'http://localhost:3000/subscriptions/cancel',
      productData: {
        name: 'Подписка',
        description: `Бизнесс подписка на ${paymentCountDays} дней`,
      },
      totalPrice,
      paymentCount,
      paymentSystem,
      typeSubscription,
      autoRenewal,
      userId: command.userId,
      paymentId: null,
    };
    try {
      const newPaymentInfo =
        await this.paymentsRepository.createPaymentTransaction({
          price: totalPrice,
          paymentSystem,
          status: TransactionStatuses.PENDING,
        });
      paymentData.paymentId = newPaymentInfo.id;
      const newPament = await this.paymentManager.makePayment(paymentData);
      await this.paymentsRepository.createOrder({
        userId: command.userId,
        subscriptionType: typeSubscription,
        price: totalPrice,
        paymentId: newPaymentInfo.id,
      });
      return { url: newPament.url };
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException();
    }
  }
}
