import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';

import { GatewayServiceClientAdapter } from '../../../../../common/adapters/gateway-service-client.adapter';
import { SubscriptionStatuses } from '../../../../../common/enum/transaction-statuses.enum';
import { IStripeEventHandler } from '../../../../../common/interfaces/stripe-event-handler.interface';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
//TODO app notification
@Injectable()
export class StripeSubscriptionDeletedHandler implements IStripeEventHandler {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly gatewayServiceClientAdapter: GatewayServiceClientAdapter,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(StripeSubscriptionDeletedHandler.name);
  }

  async handle(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
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
      subscriptionInfo.isActive = false;
      subscriptionInfo.endDateOfSubscription = remainingEndDate;
      await this.paymentsRepository.updateSub(subscriptionInfo);

      // TODO: В 3 кейсах может упасть найти где именно. [Nest] 12766  - 01/20/2025, 5:31:59 PM   ERROR [StripeWebhookUseCase] TypeError: Cannot read properties of null (reading 'userId')
      this.gatewayServiceClientAdapter.sendSubscriptionInfo({
        userId: subscriptionInfo.userId,
        endDateOfSubscription: subscriptionInfo.endDateOfSubscription,
      });
    }
  }
}
