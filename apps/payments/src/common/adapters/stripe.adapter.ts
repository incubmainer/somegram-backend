import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaymentData } from '../../features/payments/application/types/payment-data.type';
import { SubscriptionType } from '../../../../../libs/common/enums/payments';
import { LoggerService } from '@app/logger';
import { ConfigurationType } from '../../settings/configuration/configuration';
import { EnvSettings } from '../../settings/env/env.settings';

@Injectable()
export class StripeAdapter {
  private stripe: Stripe;
  private readonly envSettings: EnvSettings;
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(StripeAdapter.name);
    this.envSettings = this.configService.get('envSettings', { infer: true });
    this.stripe = new Stripe(this.envSettings.STRIPE_API_SECRET_KEY);
  }

  public async createAutoPayment(payload: PaymentData): Promise<string | null> {
    this.logger.debug(
      'Execute: create stripe payment',
      this.createAutoPayment.name,
    );
    try {
      const interval = await this.getIntervalBySubType(
        payload.subscriptionType,
      );
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
      this.logger.error(e, this.createAutoPayment.name);
      return null;
    }
  }

  public async disableAutoRenewal(
    paymentSystemSubId: string,
  ): Promise<boolean> {
    this.logger.debug(
      'Execute: disable stripe auto renewal',
      this.disableAutoRenewal.name,
    );
    try {
      await this.stripe.subscriptions.update(paymentSystemSubId, {
        cancel_at_period_end: true,
      });
      return true;
    } catch (e) {
      this.logger.error(e, this.disableAutoRenewal.name);
      return false;
    }
  }

  public async enableAutoRenewal(paymentSystemSubId: string): Promise<boolean> {
    this.logger.debug(
      'Execute: enable stripe auto renewal',
      this.enableAutoRenewal.name,
    );
    try {
      await this.stripe.subscriptions.update(paymentSystemSubId, {
        cancel_at_period_end: false,
      });
      return true;
    } catch (e) {
      this.logger.error(e, this.enableAutoRenewal.name);
      return false;
    }
  }

  public async testingCancelSubscription(paymentSystemSubId: string) {
    try {
      const canceledSubscription =
        await this.stripe.subscriptions.cancel(paymentSystemSubId);

      return {
        status: canceledSubscription.status,
        subscriptionId: canceledSubscription.id,
      };
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException(
        `Error cancel subscription : ${e.message}`,
      );
    }
  }

  private async createPricePlan(payload: PaymentData) {
    this.logger.debug(
      'Execute: create stripe price plan',
      this.createPricePlan.name,
    );
    const interval = await this.getIntervalBySubType(payload.subscriptionType);
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

  public async updateAutoPayment(payload: PaymentData): Promise<string | null> {
    this.logger.debug(
      'Execute: update stripe payment',
      this.updateAutoPayment.name,
    );
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: payload.customerId,
      });
      const activeSubscription = subscriptions.data.find(
        (subscription) =>
          subscription.metadata.userId === payload.userInfo.userId,
      );

      const existingSubscriptionItem = activeSubscription.items.data[0];

      await this.stripe.subscriptions.update(activeSubscription.id, {
        trial_end: activeSubscription.current_period_end,
        proration_behavior: 'none',
        items: [
          {
            id: existingSubscriptionItem.id,
            price: await this.createPricePlan(payload),
          },
        ],
        metadata: {
          userId: payload.userInfo.userId,
        },
      });

      return 'Success'; // TODO Поговорить и решить можно ли сделать как с paypal
    } catch (e) {
      this.logger.error(e, this.updateAutoPayment.name);
      return null;
    }
  }

  private async getIntervalBySubType(typeSubscription: SubscriptionType) {
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
