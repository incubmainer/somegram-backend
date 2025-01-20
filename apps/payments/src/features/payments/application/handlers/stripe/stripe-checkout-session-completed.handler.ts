import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';

import { SubscriptionStatuses } from '../../../../../common/enum/transaction-statuses.enum';
import { IStripeEventHandler } from '../../../../../common/interfaces/stripe-event-handler.interface';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { PaymentSystem } from '../../../../../../../../libs/common/enums/payments';
import { PaymentManager } from '../../../../../common/managers/payment.manager';
//TODO app notification
@Injectable()
export class StripeCheckouSessionCompletedHandler
  implements IStripeEventHandler
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly logger: LoggerService,
    private readonly paymentManager: PaymentManager,
  ) {
    this.logger.setContext(StripeCheckouSessionCompletedHandler.name);
  }

  async handle(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    const subId = session.client_reference_id;
    const existingSubscription =
      await this.paymentsRepository.getSubscriptionById(subId);

    // TODO: В 3 кейсах может упасть найти где именно. [Nest] 12766  - 01/20/2025, 5:31:59 PM   ERROR [StripeWebhookUseCase] TypeError: Cannot read properties of null (reading 'userId')
    const oldSubscription =
      await this.paymentsRepository.getActiveSubscriptionByUserId(
        existingSubscription.userId,
      );
    if (oldSubscription && oldSubscription.id !== existingSubscription.id) {
      await this.paymentManager.cancelSubscription(
        oldSubscription.paymentSystem as PaymentSystem,
        oldSubscription.paymentSystemSubId,
      );
    }

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
