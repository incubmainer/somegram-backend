import { PaymentSystem } from '../../../../../libs/common/enums/payments';
import { PaymentData } from '../../features/payments/application/types/payment-data.type';
import { StripeAdapter } from '../adapters/stripe.adapter';

export class PaymentManager {
  constructor() {}

  async makePayment(payment: PaymentData) {
    if (payment.paymentSystem === PaymentSystem.PAYPAL) {
    }

    if (payment.paymentSystem === PaymentSystem.STRIPE) {
      const stripeAdapter = new StripeAdapter();
      return await stripeAdapter.createPayment(payment);
    }
  }
}
