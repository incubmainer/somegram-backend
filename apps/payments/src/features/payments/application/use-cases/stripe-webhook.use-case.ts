import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import stripe, * as Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

import { PaymentsRepository } from '../../infrastructure/payments.repository';
import { TransactionStatuses } from '../../../../common/enum/transaction-statuses.enum';
import { PaymentSystem } from '../../../../../../../libs/common/enums/payments';

export class StripeWebhookCommand {
  constructor(
    public rawBody: Buffer,
    public signatureHeader: string,
  ) {}
}

@CommandHandler(StripeWebhookCommand)
export class StripeWebhookUseCase
  implements ICommandHandler<StripeWebhookCommand>
{
  configService = new ConfigService();
  signatureSecret = this.configService.get<string>('STRIPE_SIGNATURE_SECRET');
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async execute(command: StripeWebhookCommand) {
    const extractedRawBody = Buffer.from(command.rawBody);
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        extractedRawBody,
        command.signatureHeader,
        this.signatureSecret,
      );

      if (event.type === 'invoice.payment_succeeded') {
        const invoce = event.data.object as Stripe.Stripe.Invoice;
        const subscriptionId = invoce.subscription as string;

        const subscription =
          await this.paymentsRepository.getSubscriptionByPaymentSystemSubId(
            subscriptionId,
          );
        if (!subscription) {
          throw new BadRequestException(
            'Webhook Error: Subscription not found',
          );
        }

        const subscriptionData = invoce.lines.data;

        subscriptionData.forEach(async (sb) => {
          const subscriptionDataPeriod = {
            start: new Date(sb.period.start * 1000),
            end: new Date(sb.period.end * 1000),
          };

          subscription.dateOfPayment = new Date(sb.period.start * 1000);
          subscription.endDateOfSubscription = new Date(sb.period.end * 1000);
          await this.paymentsRepository.updateSubscription(subscription);
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
        });
      }

      if (event.type === 'invoice.payment_failed') {
        const invoce = event.data.object as Stripe.Stripe.Invoice;
        const subscriptionId = invoce.subscription as string;
        const subscription =
          await this.paymentsRepository.getSubscriptionByPaymentSystemSubId(
            subscriptionId,
          );
        if (!subscription) {
          throw new BadRequestException(
            'Webhook Error: Subscription not found',
          );
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

      if (event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as Stripe.Stripe.Subscription;
        const subId = subscription.id;
        const existingSubscription =
          await this.paymentsRepository.getSubscriptionByPaymentSystemSubId(
            subId,
          );
        if (existingSubscription) {
          existingSubscription.status = subscription.status;
          existingSubscription.autoRenewal = subscription.cancel_at_period_end
            ? false
            : true;
          existingSubscription.paymentSystemSubId = subId;
          existingSubscription.updatedAt = new Date();
          // existingSubscription.dateOfPayment =
          //   existingSubscription.endDateOfSubscription = new Date(
          //     subscription.current_period_start * 1000,
          //   );
          // existingSubscription.endDateOfSubscription = new Date(
          //   subscription.current_period_end * 1000,
          // );
          await this.paymentsRepository.updateSubscription(
            existingSubscription,
          );
        } else {
          await this.paymentsRepository.createSubscription({
            userId: subscription.metadata.userId,
            autoRenewal: true,
            paymentSystem: PaymentSystem.STRIPE,
            paymentSystemSubId: subId,
            status: subscription.status,
            // dateOfPayment: new Date(subscription.current_period_start * 1000),
            // endDateOfSubscription: new Date(
            //   subscription.current_period_end * 1000,
            // ),
          });
        }
      }

      if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Stripe.Subscription;
        const subId = subscription.id;
        const subscriptionInfo =
          await this.paymentsRepository.getSubscriptionByPaymentSystemSubId(
            subId,
          );
        if (subscriptionInfo) {
          const remainingEndDate = subscriptionInfo.endDateOfSubscription;
          subscriptionInfo.updatedAt = new Date();
          subscriptionInfo.status = subscription.status;
          subscriptionInfo.autoRenewal = false;
          subscriptionInfo.endDateOfSubscription = remainingEndDate;
          await this.paymentsRepository.updateSubscription(subscriptionInfo);
        }
      }
      return true;
    } catch (err) {
      console.error(err);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }
}
