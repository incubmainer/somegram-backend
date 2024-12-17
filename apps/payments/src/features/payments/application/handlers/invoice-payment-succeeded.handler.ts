import { BadRequestException } from '@nestjs/common';
import * as Stripe from 'stripe';

import { PaymentSystem } from '../../../../../../../libs/common/enums/payments';
import { GatewayServiceClientAdapter } from '../../../../common/adapters/gateway-service-client.adapter';
import { TransactionStatuses } from '../../../../common/enum/transaction-statuses.enum';
import { IStripeEventHandler } from '../../../../common/interfaces/stripe-event-handler.interface';
import { PaymentsRepository } from '../../infrastructure/payments.repository';

export class InvoicePaymentSucceededHandler implements IStripeEventHandler {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly gatewayServiceClientAdapter: GatewayServiceClientAdapter,
  ) {}

  async handle(event: any): Promise<void> {
    const invoice = event.data.object as Stripe.Stripe.Invoice;
    const subscriptionId = invoice.subscription as string;

    const subscription =
      await this.paymentsRepository.getSubscriptionByPaymentSystemSubId(
        subscriptionId,
      );
    if (!subscription) {
      throw new BadRequestException('Webhook Error: Subscription not found');
    }

    const subscriptionData = invoice.lines.data[0];

    const subscriptionDataPeriod = {
      start: new Date(subscriptionData.period.start * 1000),
      end: new Date(subscriptionData.period.end * 1000),
    };

    subscription.dateOfPayment = new Date(subscriptionData.period.start * 1000);
    subscription.endDateOfSubscription = new Date(
      subscriptionData.period.end * 1000,
    );
    subscription.paymentSystemCustomerId = invoice.customer as string;

    const subInfo =
      await this.paymentsRepository.updateSubscription(subscription);
    this.gatewayServiceClientAdapter.sendSubscriptionInfo({
      userId: subInfo.userId,
      endDateOfSubscription: subInfo.endDateOfSubscription,
    });

    const newPayment = {
      status: TransactionStatuses.PaymentSucceeded,
      price: subscriptionData.amount,
      paymentSystem: PaymentSystem.STRIPE,
      subscriptionType: subscriptionData.plan.interval,
      subId: subscription.id,
      dateOfPayment: subscriptionDataPeriod.start,
      endDateOfSubscription: subscriptionDataPeriod.end,
    };

    await this.paymentsRepository.createPaymentTransaction(newPayment);
  }
}
