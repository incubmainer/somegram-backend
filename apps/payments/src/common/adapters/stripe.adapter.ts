import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PaymentData } from '../../features/payments/application/types/payment-data.type';
import { InternalServerErrorException } from '@nestjs/common';

export class StripeAdapter {
  configService = new ConfigService();
  stripe = new Stripe(this.configService.get<string>('STRIPE_API_SECRET_KEY'));
  constructor() {}

  // public async createPayment(payload: PaymentData) {
  //   const result = await this.stripe.checkout.sessions.create({
  //     success_url: payload.successFrontendUrl,
  //     cancel_url: payload.cancelFrontendUrl,
  //     line_items: [
  //       {
  //         price_data: {
  //           product_data: {
  //             name: payload.productData.name,
  //             description: payload.productData.description,
  //           },
  //           unit_amount: payload.totalPrice,
  //           currency: 'USD',
  //         },
  //         quantity: payload.paymentCount,
  //       },
  //     ],
  //     mode: 'payment',
  //     client_reference_id: payload.paymentId,
  //     metadata: {
  //       userId: payload.userInfo.userId,
  //     },
  //   });

  //   return {
  //     status: result.status,
  //     url: result.url,
  //     stripePaymentData: result,
  //   };
  // }
  public async createAutoPayment(payload: PaymentData) {
    let interval;

    switch (payload.typeSubscription) {
      case 'MONTHLY':
        interval = 'month';
        break;
      case 'WEEKLY':
        interval = 'week';
        break;
      case 'DAY':
        interval = 'day';
        break;
      default:
        throw new InternalServerErrorException();
    }
    try {
      let customer;

      const existingCustomers = await this.stripe.customers.list({
        email: payload.userInfo.email,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await this.stripe.customers.create({
          name: payload.userInfo.userName,
          email: payload.userInfo.email,
          description: payload.userInfo.email,
          metadata: {
            userId: payload.userInfo.userId,
          },
        });
      }

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
              recurring: {
                interval: interval,
                interval_count: payload.paymentCount,
              },
              unit_amount: payload.price,
              currency: 'USD',
            },
            quantity: payload.paymentCount,
          },
        ],
        mode: 'subscription',
        subscription_data: {
          metadata: {
            userId: payload.userInfo.userId,
          },
        },
        client_reference_id: payload.orderId,
        customer: customer.id,
        metadata: {
          userId: payload.userInfo.userId,
        },
      });

      return {
        status: result.status,
        url: result.url,
        stripePaymentData: result,
      };
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
