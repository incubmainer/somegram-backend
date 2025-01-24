import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { IStripeEventHandler } from '../../../../../common/interfaces/stripe-event-handler.interface';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { PaymentService } from '../../payments.service';
import { SubscriptionStatuses } from '../../../../../common/enum/subscription-types.enum';

@Injectable()
export class StripeCheckouSessionCompletedHandler
  implements IStripeEventHandler
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
    private readonly paymentService: PaymentService,
  ) {
    this.logger.setContext(StripeCheckouSessionCompletedHandler.name);
  }

  async handle(event: Stripe.Event): Promise<AppNotificationResultType<null>> {
    try {
      this.logger.debug('Execute: checkout stripe session', this.handle.name);
      const session = event.data.object as Stripe.Checkout.Session;
      const subId = session.client_reference_id;
      const existingSubscription =
        await this.paymentsRepository.getSubscriptionById(subId);

      if (!existingSubscription) return this.appNotification.notFound();

      await this.paymentService.handleActiveSubscription(
        existingSubscription.userId,
        existingSubscription.id,
      );

      if (existingSubscription) {
        existingSubscription.status = SubscriptionStatuses.Active;
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
