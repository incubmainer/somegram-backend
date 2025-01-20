import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

import { SubscriptionStatuses } from '../../../../../common/enum/transaction-statuses.enum';
import { IStripeEventHandler } from '../../../../../common/interfaces/stripe-event-handler.interface';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { PaymentSystem } from '../../../../../../../../libs/common/enums/payments';
import { PaymentManager } from '../../../../../common/managers/payment.manager';

@Injectable()
export class StripeCheckouSessionCompletedHandler
  implements IStripeEventHandler
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly logger: LoggerService,
    private readonly paymentManager: PaymentManager,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(StripeCheckouSessionCompletedHandler.name);
  }

  async handle(event: Stripe.Event): Promise<AppNotificationResultType<null>> {
    try {
      const session = event.data.object as Stripe.Checkout.Session;
      const subId = session.client_reference_id;
      const existingSubscription =
        await this.paymentsRepository.getSubscriptionById(subId);

      if (!existingSubscription) return this.appNotification.notFound();

      const oldSubscription =
        await this.paymentsRepository.getActiveSubscriptionByUserId(
          existingSubscription.userId,
        );
      if (oldSubscription && oldSubscription.id !== existingSubscription.id) {
        await this.paymentManager.testingCancelSubscription(
          oldSubscription.paymentSystem as PaymentSystem,
          oldSubscription.paymentSystemSubId,
        );
      }

      if (existingSubscription) {
        existingSubscription.status = SubscriptionStatuses.Active;
        existingSubscription.isActive = true;
        existingSubscription.paymentSystemSubId =
          session.subscription as string;
        existingSubscription.paymentSystemCustomerId =
          session.customer as string;
        await this.paymentsRepository.updateSubscription(existingSubscription);
      }
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.handle.name);
      return this.appNotification.internalServerError();
    }
  }
}
