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
        console.log(event.type);
        const subscriptionId = invoce.subscription as string;
        console.log(subscriptionId);
        const order =
          await this.paymentsRepository.getOrderByPaymentSystemOrderId(
            subscriptionId,
          );
        if (!order) {
          throw new BadRequestException(
            'Webhook Error: Subscription not found',
          );
        }
        const subscriptionPeriod = invoce.lines.data[0].period;
        const newPayment = {
          status: TransactionStatuses.PaymentSucceeded,
          price: order.price,
          paymentSystem: PaymentSystem.STRIPE,
          orderId: order.id,
          createdAt: new Date(subscriptionPeriod.start * 1000),
        };

        await this.paymentsRepository.createPaymentTransaction(newPayment);

        order.updatedAt = new Date();
        order.dateOfPayment = new Date(subscriptionPeriod.start * 1000);
        order.endDateOfSubscription = new Date(subscriptionPeriod.end * 1000);
        await this.paymentsRepository.updateOrder(order);
        console.log('Pyment successfully');
      }

      if (event.type === 'invoice.payment_failed') {
        const invoce = event.data.object as Stripe.Stripe.Invoice;
        console.log(event.type);
        const subscriptionId = invoce.subscription as string;
        console.log(subscriptionId);
        const order =
          await this.paymentsRepository.getOrderByPaymentSystemOrderId(
            subscriptionId,
          );
        if (!order) {
          throw new BadRequestException(
            'Webhook Error: Subscription not found',
          );
        }
        const subscriptionPeriod = invoce.lines.data[0].period;
        const newPayment = {
          status: TransactionStatuses.PaymentFailed,
          price: order.price,
          paymentSystem: PaymentSystem.STRIPE,
          orderId: order.id,
          createdAt: new Date(subscriptionPeriod.start * 1000),
        };
        await this.paymentsRepository.createPaymentTransaction(newPayment);
        console.log('Pyment failed');
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Stripe.Checkout.Session;
        console.log(event.type);
        const orderId = session.client_reference_id;
        const subscriptionId = session.subscription as string;

        console.log(orderId);
        console.log(subscriptionId);

        const order = await this.paymentsRepository.getOrderById(orderId);

        if (!order) {
          throw new BadRequestException(
            'Webhook Error: Subscription not found',
          );
        }
        order.paymentSystemOrderId = subscriptionId;
        order.updatedAt = new Date();
        await this.paymentsRepository.updateOrder(order);

        console.log('Subscription successfully');
      }

      return true;
    } catch (err) {
      console.error(err);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }
  }
}
