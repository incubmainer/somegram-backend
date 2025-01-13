import * as Stripe from 'stripe';

import { GatewayServiceClientAdapter } from '../../../../common/adapters/gateway-service-client.adapter';
import { IStripeEventHandler } from '../../../../common/interfaces/stripe-event-handler.interface';
import { PaymentsRepository } from '../../infrastructure/payments.repository';
import { SubscriptionStatuses } from '../../../../common/enum/transaction-statuses.enum';

export class SubscriptionDeletedHandler implements IStripeEventHandler {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly gatewayServiceClientAdapter: GatewayServiceClientAdapter,
  ) {}

  async handle(event: any): Promise<void> {
    const subscription = event.data.object as Stripe.Stripe.Subscription;
    const subId = subscription.id;
    const subscriptionInfo =
      await this.paymentsRepository.getSubscriptionByPaymentSystemSubId(subId);
    if (
      subscriptionInfo &&
      subscriptionInfo.status !== SubscriptionStatuses.Canceled
    ) {
      const remainingEndDate = subscriptionInfo.endDateOfSubscription;
      subscriptionInfo.updatedAt = new Date();
      subscriptionInfo.status = SubscriptionStatuses.Canceled;
      subscriptionInfo.autoRenewal = false;
      subscriptionInfo.endDateOfSubscription = remainingEndDate;
      const subInfo =
        await this.paymentsRepository.updateSubscription(subscriptionInfo);
      this.gatewayServiceClientAdapter.sendSubscriptionInfo({
        userId: subInfo.userId,
        endDateOfSubscription: subInfo.endDateOfSubscription,
      });
    }
  }
}
