import { Injectable } from '@nestjs/common';
import { IPayPalEventHandler } from '../../../../../common/interfaces/paypal-event-handler.interface';
import {
  PayPalWebHookEventType,
  WHSubscriptionActiveType,
} from '../../../../../common/adapters/types/paypal/types';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { Subscription } from '@prisma/payments';

@Injectable()
export class PaypalSubscriptionActiveHandler
  implements
    IPayPalEventHandler<PayPalWebHookEventType<WHSubscriptionActiveType>>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appNotification: ApplicationNotification,
  ) {}

  async handle(
    event: PayPalWebHookEventType<WHSubscriptionActiveType>,
  ): Promise<AppNotificationResultType<null>> {
    try {
      const { id, billing_info, subscriber } = event.resource;

      const subscription: Subscription | null =
        await this.paymentsRepository.getSubscriptionByPaymentSystemSubId(id);

      if (!subscription) return this.appNotification.notFound();

      subscription.endDateOfSubscription = billing_info.next_billing_time;
      subscription.paymentSystemCustomerId = subscriber.payer_id;
      subscription.updatedAt = new Date();

      await this.paymentsRepository.updateSubscription(subscription);

      return this.appNotification.success(null);
    } catch (e) {
      //TODO Logger
      return this.appNotification.internalServerError();
    }
  }
}
