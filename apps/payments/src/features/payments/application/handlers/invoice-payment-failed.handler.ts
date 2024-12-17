import { BadRequestException } from '@nestjs/common';
import * as Stripe from 'stripe';

import { PaymentSystem } from '../../../../../../../libs/common/enums/payments';
import { TransactionStatuses } from '../../../../common/enum/transaction-statuses.enum';
import { IStripeEventHandler } from '../../../../common/interfaces/stripe-event-handler.interface';
import { PaymentsRepository } from '../../infrastructure/payments.repository';

export class InvoicePaymentFailedHandler implements IStripeEventHandler {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async handle(event: any): Promise<void> {
    const invoce = event.data.object as Stripe.Stripe.Invoice;
    const subscriptionId = invoce.subscription as string;
    const subscription =
      await this.paymentsRepository.getSubscriptionByPaymentSystemSubId(
        subscriptionId,
      );
    if (!subscription) {
      throw new BadRequestException('Webhook Error: Subscription not found');
    }
    subscription.dateOfPayment = new Date(invoce.period_start * 1000);
    subscription.endDateOfSubscription = new Date(invoce.period_end * 1000);
    await this.paymentsRepository.updateSubscription(subscription);
    const subscriptionData = invoce.lines.data[0];
    const newPayment = {
      status: TransactionStatuses.PaymentFailed,
      price: subscriptionData.amount,
      paymentSystem: PaymentSystem.STRIPE,
      subscriptionType: subscriptionData.plan.interval,
      subId: subscription.id,
      dateOfPayment: new Date(subscriptionData.period.start * 1000),
    };
    await this.paymentsRepository.createPaymentTransaction(newPayment);
  }
}
