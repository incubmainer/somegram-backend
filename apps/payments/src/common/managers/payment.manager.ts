import { Injectable } from '@nestjs/common';
import { PaymentSystem } from '../../../../../libs/common/enums/payments';
import { PaymentData } from '../../features/payments/application/types/payment-data.type';
import { StripeAdapter } from '../adapters/stripe.adapter';

@Injectable()
export class PaymentManager {
  constructor(private readonly stripeAdapter: StripeAdapter) {}

  async createAutoPayment(payment: PaymentData): Promise<string> {
    if (payment.paymentSystem === PaymentSystem.PAYPAL) {
    }

    if (payment.paymentSystem === PaymentSystem.STRIPE) {
      return await this.stripeAdapter.createAutoPayment(payment);
    }
  }

  async updateCurrentSub(payment: PaymentData) {
    if (payment.paymentSystem === PaymentSystem.PAYPAL) {
    }

    if (payment.paymentSystem === PaymentSystem.STRIPE) {
      return await this.stripeAdapter.updateAutoPayment(payment);
    }
  }

  async disableAutoRenewal(
    paymentSystem: PaymentSystem,
    paymentSubscriptionSubId: string,
  ) {
    if (paymentSystem === PaymentSystem.PAYPAL) {
    }

    if (paymentSystem === PaymentSystem.STRIPE) {
      return await this.stripeAdapter.disableAutoRenewal(
        paymentSubscriptionSubId,
      );
    }
  }

  async enableAutoRenewal(
    paymentSystem: PaymentSystem,
    paymentSubscriptionSubId: string,
  ) {
    if (paymentSystem === PaymentSystem.PAYPAL) {
    }

    if (paymentSystem === PaymentSystem.STRIPE) {
      return await this.stripeAdapter.enableAutoRenewal(
        paymentSubscriptionSubId,
      );
    }
  }

  async testingCancelSubscription(
    paymentSystem: PaymentSystem,
    paymentSubscriptionSubId: string,
  ) {
    if (paymentSystem === PaymentSystem.PAYPAL) {
    }

    if (paymentSystem === PaymentSystem.STRIPE) {
      return await this.stripeAdapter.testingCancelSubscription(
        paymentSubscriptionSubId,
      );
    }
  }
}
