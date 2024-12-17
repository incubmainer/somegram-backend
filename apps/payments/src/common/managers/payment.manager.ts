import { PaymentSystem } from '../../../../../libs/common/enums/payments';
import { PaymentData } from '../../features/payments/application/types/payment-data.type';
import { StripeAdapter } from '../adapters/stripe.adapter';
import { PayPalAdapter } from '../adapters/paypal.adapter';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentManager {
  constructor(private readonly payPalAdapter: PayPalAdapter) {}
  async createAutoPayment(payment: PaymentData) {
    if (payment.paymentSystem === PaymentSystem.PAYPAL) {
      return await this.payPalAdapter.createAutoPayment(payment);
    }

    if (payment.paymentSystem === PaymentSystem.STRIPE) {
      const stripeAdapter = new StripeAdapter();
      return await stripeAdapter.createAutoPayment(payment);
    }
  }

  async updateCurrentSub(payment: PaymentData) {
    if (payment.paymentSystem === PaymentSystem.PAYPAL) {
    }

    if (payment.paymentSystem === PaymentSystem.STRIPE) {
      const stripeAdapter = new StripeAdapter();
      return await stripeAdapter.updateAutoPayment(payment);
    }
  }
  async disableAutoRenewal(
    paymentSystem: PaymentSystem,
    paymentSubscriptionSubId: string,
  ) {
    if (paymentSystem === PaymentSystem.PAYPAL) {
    }

    if (paymentSystem === PaymentSystem.STRIPE) {
      const stripeAdapter = new StripeAdapter();
      return await stripeAdapter.disableAutoRenewal(paymentSubscriptionSubId);
    }
  }

  async enableAutoRenewal(
    paymentSystem: PaymentSystem,
    paymentSubscriptionSubId: string,
  ) {
    if (paymentSystem === PaymentSystem.PAYPAL) {
    }

    if (paymentSystem === PaymentSystem.STRIPE) {
      const stripeAdapter = new StripeAdapter();
      return await stripeAdapter.enableAutoRenewal(paymentSubscriptionSubId);
    }
  }
}
