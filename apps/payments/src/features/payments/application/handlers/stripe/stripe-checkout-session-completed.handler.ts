import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';

import { SubscriptionStatuses } from '../../../../../common/enum/transaction-statuses.enum';
import { IStripeEventHandler } from '../../../../../common/interfaces/stripe-event-handler.interface';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';

@Injectable()
export class StripeCheckouSessionCompletedHandler
  implements IStripeEventHandler
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(StripeCheckouSessionCompletedHandler.name);
  }

  async handle(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    const subId = session.client_reference_id;
    const existingSubscription =
      await this.paymentsRepository.getSubscriptionById(subId);

    if (existingSubscription) {
      existingSubscription.status = SubscriptionStatuses.Active;
      existingSubscription.isActive = true;
      existingSubscription.paymentSystemSubId = session.subscription as string;
      existingSubscription.updatedAt = new Date();
      existingSubscription.paymentSystemCustomerId = session.customer as string;
      await this.paymentsRepository.updateSub(existingSubscription);
    }
  }
}
