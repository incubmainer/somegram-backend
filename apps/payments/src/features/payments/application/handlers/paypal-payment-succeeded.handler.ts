import { Injectable } from '@nestjs/common';
import { IPayPalEventHandler } from '../../../../common/interfaces/paypal-event-handler.interface';
import {
  PayPalWebHookEventType,
  WHPaymentSaleType,
} from '../../../../common/adapters/types/paypal/types';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { PaymentsRepository } from '../../infrastructure/payments.repository';
import { Subscription } from '@prisma/payments';
import { SubscriptionStatuses } from '../../../../common/enum/transaction-statuses.enum';

@Injectable()
export class PayPalPaymentSucceededHandler
  implements IPayPalEventHandler<PayPalWebHookEventType<WHPaymentSaleType>>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appNotification: ApplicationNotification,
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

      subscription.dateOfPayment = create_time;
      subscription.updatedAt = new Date();
      subscription.status = SubscriptionStatuses.Active;

      await this.paymentsRepository.updateSubscription(subscription);

      return this.appNotification.success(null);
    } catch (e) {
      //TODO Logger
      return this.appNotification.internalServerError();
    }
  }
}
