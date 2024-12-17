import * as Stripe from 'stripe';

import { PaymentSystem } from '../../../../../../../libs/common/enums/payments';
import { IStripeEventHandler } from '../../../../common/interfaces/stripe-event-handler.interface';
import { PaymentsRepository } from '../../infrastructure/payments.repository';
import { SubscriptionStatuses } from '../../../../common/enum/transaction-statuses.enum';

export class SubscriptionUpdatedHandler implements IStripeEventHandler {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async handle(event: any): Promise<void> {
    const subscription = event.data.object as Stripe.Stripe.Subscription;
    const subId = subscription.id;
    const existingSubscription =
      await this.paymentsRepository.getSubscriptionByPaymentSystemSubId(subId);
    if (existingSubscription) {
      existingSubscription.status = SubscriptionStatuses.Active;
      existingSubscription.autoRenewal = subscription.cancel_at_period_end
        ? false
        : true;
      existingSubscription.paymentSystemSubId = subId;
      existingSubscription.updatedAt = new Date();
      existingSubscription.paymentSystemCustomerId =
        subscription.customer as string;
      await this.paymentsRepository.updateSubscription(existingSubscription);
    } else {
      await this.paymentsRepository.createSubscription({
        userId: subscription.metadata.userId,
        autoRenewal: true,
        paymentSystem: PaymentSystem.STRIPE,
        paymentSystemSubId: subId,
        status: SubscriptionStatuses.Active,
      });
    }
  }
}
