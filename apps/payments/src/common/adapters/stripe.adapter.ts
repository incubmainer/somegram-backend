import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PaymentData } from '../../features/payments/application/types/payment-data.type';

export class StripeAdapter {
  configService = new ConfigService();
  stripe = new Stripe(this.configService.get<string>('STRIPE_API_SECRET_KEY'));
  constructor() {}

  public async createPayment(payload: PaymentData) {
    const result = await this.stripe.checkout.sessions.create({
      success_url: payload.successFrontendUrl,
      cancel_url: payload.cancelFrontendUrl,
      line_items: [
        {
          price_data: {
            product_data: {
              name: payload.productData.name,
              description: payload.productData.description,
            },
            unit_amount: payload.totalPrice,
            currency: 'USD',
          },
          quantity: payload.paymentCount,
        },
      ],
      mode: 'payment',
      client_reference_id: payload.paymentId,
      metadata: {
        userId: payload.userId,
      },
    });

    return {
      status: result.status,
      url: result.url,
      stripePaymentData: result,
    };
  }
}
