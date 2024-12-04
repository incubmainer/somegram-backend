import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

import { PaymentData } from '../../features/payments/application/types/payment-data.type';
import { PaymentTime } from '../../../../../libs/common/enums/payments';

export class StripeAdapter {
  configService = new ConfigService();
  stripe = new Stripe(this.configService.get<string>('STRIPE_API_SECRET_KEY'));
  constructor() {}

  public async createAutoPayment(payload: PaymentData) {
    const interval = await this.getIntervalBySubType(payload.typeSubscription);

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
        customer: customer.id,
        metadata: {
          userId: payload.userInfo.userId,
        },
      });

      return result.url;
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException();
    }
  }

  public async disableAutoRenewal(paymentSystemSubId: string) {
    try {
      const canceledSubscription = await this.stripe.subscriptions.update(
        paymentSystemSubId,
        {
          cancel_at_period_end: true,
        },
      );

      return {
        status: canceledSubscription.status,
        subscriptionId: canceledSubscription.id,
      };
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException(
        `Error disable autorenewal : ${e.message}`,
      );
    }
  }

  public async enableAutoRenewal(paymentSystemSubId: string) {
    try {
      const canceledSubscription = await this.stripe.subscriptions.update(
        paymentSystemSubId,
        {
          cancel_at_period_end: false,
        },
      );

      return {
        status: canceledSubscription.status,
        subscriptionId: canceledSubscription.id,
      };
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException(
        `Error enable autorenewal : ${e.message}`,
      );
    }
  }

  private async createPricePlan(payload: PaymentData) {
    const interval = await this.getIntervalBySubType(payload.typeSubscription);
    const pricePlan = await this.stripe.prices.create({
      product: await this.stripe.products
        .create({
          name: payload.productData.name,
          description: payload.productData.description,
        })
        .then((product) => product.id),
      currency: 'USD',
      unit_amount: payload.price,
      recurring: {
        interval: interval,
        interval_count: payload.paymentCount,
      },
    });

    return pricePlan.id;
  }

  public async updateAutoPayment(payload: PaymentData) {
    try {
      // Получаем список подписок для пользователя
      const subscriptions = await this.stripe.subscriptions.list({
        customer: await this.getCustomerId(payload.userInfo.email),
        status: 'active',
      });

      // Находим активную подписку
      const activeSubscription = subscriptions.data.find(
        (subscription) =>
          subscription.metadata.userId === payload.userInfo.userId,
      );

      // Получаем существующий элемент подписки
      const existingSubscriptionItem = activeSubscription.items.data[0];

      // Обновляем существующий элемент подписки с новым планом цен
      const updatedSubscription = await this.stripe.subscriptions.update(
        activeSubscription.id,
        {
          trial_end: activeSubscription.current_period_end,
          proration_behavior: 'none',
          items: [
            {
              id: existingSubscriptionItem.id,
              price: await this.createPricePlan(payload),
            },
          ],
        },
      );

      return updatedSubscription;
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException();
    }
  }

  private async getCustomerId(email: string) {
    const customers = await this.stripe.customers.list({
      email: email,
    });

    if (customers.data.length > 0) {
      return customers.data[0].id;
    } else {
      throw new InternalServerErrorException();
    }
  }

  private async getIntervalBySubType(typeSubscription: PaymentTime) {
    let interval: Stripe.PriceCreateParams.Recurring.Interval;

    switch (typeSubscription) {
      case 'MONTHLY':
        interval = 'month';
        break;
      case 'WEEKLY':
        interval = 'week';
        break;
      case 'DAY':
        interval = 'day';
        break;
    }
    return interval;
  }
}
