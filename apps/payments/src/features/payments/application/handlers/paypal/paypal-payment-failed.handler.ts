import { Inject, Injectable } from '@nestjs/common';
import { IPayPalEventHandler } from '../../../../../common/interfaces/paypal-event-handler.interface';
import {
  PayPalWebHookEventType,
  SubscriptionDetailsType,
  WHPaymentSaleType,
} from '../../../../../common/adapters/types/paypal/types';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { Subscription } from '@prisma/payments';
import {
  SubscriptionStatuses,
  TransactionStatuses,
} from '../../../../../common/enum/transaction-statuses.enum';
import { PaymentSystem } from '../../../../../../../../libs/common/enums/payments';
import {
  TransactionEntity,
  TransactionInputDto,
} from '../../../domain/transaction.entity';
import { PayPalAdapter } from '../../../../../common/adapters/paypal.adapter';
import {
  SubscriptionEntity,
  SubscriptionUpdateDto,
} from '../../../domain/subscription.entity';

// TODO Не доделан нормально, сделать праивльно
@Injectable()
export class PayPalPaymentFailedHandler
  implements IPayPalEventHandler<PayPalWebHookEventType<WHPaymentSaleType>>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appNotification: ApplicationNotification,
    @Inject(TransactionEntity.name)
    private readonly transactionEntity: typeof TransactionEntity,
    @Inject(SubscriptionEntity.name)
    private readonly subscriptionEntity: typeof SubscriptionEntity,
    private readonly payPalAdapter: PayPalAdapter,
  ) {}

  async handle(
    event: PayPalWebHookEventType<WHPaymentSaleType>,
  ): Promise<AppNotificationResultType<null>> {
    try {
      const { billing_agreement_id, custom, create_time } = event.resource;

      const subscription: Subscription | null =
        await this.paymentsRepository.getSubscriptionByPaymentSystemSubId(
          billing_agreement_id,
        );

      if (!subscription) return this.appNotification.notFound();

      const subscriptionDetails: SubscriptionDetailsType =
        await this.payPalAdapter.getSubscriptionDetails(
          subscription.paymentSystemSubId,
        );

      if (!subscriptionDetails)
        return this.appNotification.internalServerError();

      const subscriptionUpdateData: SubscriptionUpdateDto =
        this.generateDataUpdateSubscription(
          custom,
          create_time,
          // TODO? Посомтреть в тз когда должна прерываться подписка
          subscriptionDetails.billing_info.next_billing_time,
        );

      const transactionData: TransactionInputDto = this.generateDataTransaction(
        Number(event.resource.amount.total),
        subscription.id,
      );
      const transaction: TransactionEntity =
        this.transactionEntity.create(transactionData);

      this.subscriptionEntity.update(subscription, subscriptionUpdateData);

      await this.paymentsRepository.updateSub(subscription);
      await this.paymentsRepository.saveTransaction(transaction);

      return this.appNotification.success(null);
    } catch (e) {
      //TODO Logger
      console.log(e);
      return this.appNotification.internalServerError();
    }
  }

  private generateDataTransaction(
    price: number,
    subId: string,
  ): TransactionInputDto {
    return {
      price: price,
      system: PaymentSystem.PAYPAL,
      // @ts-ignore // TODO
      subscriptionType: 'MONTHLY',
      status: TransactionStatuses.PaymentFailed,
      subId: subId,
      // TODO
      dateOfPayment: new Date(),
      // TODO
      endDateOfSubscription: new Date(),
    };
  }

  private generateDataUpdateSubscription(
    customerId: string,
    dateOfPayment: Date,
    endDateOfSubscription: Date,
  ): SubscriptionUpdateDto {
    return {
      updatedAt: new Date(),
      dateOfPayment: dateOfPayment,
      endDateOfSubscription: endDateOfSubscription,
      paymentSystemCustomerId: customerId,
      status: SubscriptionStatuses.Canceled,
      isActive: false,
    };
  }
}
