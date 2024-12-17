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

    const subscriptionData = invoice.lines.data;
    subscriptionData.forEach(async (sb) => {
      if (sb.amount !== 0) {
        const subscriptionDataPeriod = {
          start: new Date(sb.period.start * 1000),
          end: new Date(sb.period.end * 1000),
        };

        subscription.dateOfPayment = new Date(sb.period.start * 1000);
        subscription.endDateOfSubscription = new Date(sb.period.end * 1000);
        subscription.paymentSystemCustomerId = invoice.customer as string;

        const subInfo =
          await this.paymentsRepository.updateSubscription(subscription);
        this.gatewayServiceClientAdapter.sendSubscriptionInfo({
          userId: subInfo.userId,
          endDateOfSubscription: subInfo.endDateOfSubscription,
        });

        const newPayment = {
          status: TransactionStatuses.PaymentSucceeded,
          price: sb.amount,
          paymentSystem: PaymentSystem.STRIPE,
          subscriptionType: sb.plan.interval,
          subId: subscription.id,
          dateOfPayment: subscriptionDataPeriod.start,
          endDateOfSubscription: subscriptionDataPeriod.end,
        };

        await this.paymentsRepository.createPaymentTransaction(newPayment);
      }
    });
  }
}
