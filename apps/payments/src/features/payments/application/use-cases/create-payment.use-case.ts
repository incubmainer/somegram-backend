import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';

import { PaymentsRepository } from '../../infrastructure/payments.repository';
import { CreatePaymentDto } from '../../api/dto/input-dto/create-payment.dto';
import { PaymentTime } from '../../../../../../../libs/common/enums/payments';
import { PaymentData, UserInfo } from '../types/payment-data.type';
import { PaymentsService } from '../../api/payments.service';
import { ConfigService } from '@nestjs/config';

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
      successFrontendUrl: this.successFrontendUrl,
      cancelFrontendUrl: this.cancelFrontendUrl,
      productData: {
        name: 'Бизнесс аккаунт',
        description: 'c автопродлением',
      },
      price,
      paymentCount: 1,
      paymentSystem,
      typeSubscription,
      userInfo: command.userInfo,
    };

    try {
      const subscriptionInfo =
        await this.paymentsRepository.getSubscriptionByUserId(
          command.userInfo.userId,
        );

      if (
        subscriptionInfo &&
        (subscriptionInfo.autoRenewal === true ||
          subscriptionInfo.endDateOfSubscription > new Date())
      ) {
        await this.paymentsService.updateCurrentSub(paymentData);
        return 'Subscription plan changed';
      } else {
        const newPayment =
          await this.paymentsService.createAutoPayment(paymentData);

        return { url: newPayment };
      }
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException();
    }
  }
}
