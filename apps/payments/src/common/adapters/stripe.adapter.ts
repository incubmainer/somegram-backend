import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { CommandBus } from '@nestjs/cqrs';

import { PaymentData } from '../../features/payments/application/types/payment-data.type';
import { SubscriptionType } from '../../../../../libs/common/enums/payments';
import { ConfigurationType } from '../../settings/configuration/configuration';
import { EnvSettings } from '../../settings/env/env.settings';
import {
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { StripeSubscriptionCreateCommand } from '../../features/payments/application/use-cases/command/stripe-subscription-create.use-case';

@Injectable()
export class StripeAdapter {
  private stripe: Stripe;
  private readonly envSettings: EnvSettings;
  constructor(
    private readonly configService: ConfigService<ConfigurationType, true>,
    private readonly logger: LoggerService,
    private readonly commandBus: CommandBus,
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
      const result: AppNotificationResultType<string> =
        await this.commandBus.execute(
          new StripeSubscriptionCreateCommand({
            userId: payload.userInfo.userId,
          }),
        );

      if (result.appResult !== AppNotificationResultEnum.Success) return null;

      const session = await this.stripe.checkout.sessions.create({
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
        client_reference_id: result.data,
        customer: customer.id,
        metadata: {
          userId: payload.userInfo.userId,
        },
      });

      return session.url;
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

  public async updateAutoPayment(payload: PaymentData): Promise<string> {
    this.logger.debug(
      'Execute: update stripe payment',
      this.updateAutoPayment.name,
    );
    try {
      const interval = await this.getIntervalBySubType(
        payload.subscriptionType,
      );
      const result: AppNotificationResultType<string> =
        await this.commandBus.execute(
          new StripeSubscriptionCreateCommand({
            userId: payload.userInfo.userId,
          }),
        );

      if (result.appResult !== AppNotificationResultEnum.Success) return null;

      const trialDays = this.getTrialDays(payload.currentSubDateEnd);

      const sessionPharams: Stripe.Checkout.SessionCreateParams = {
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
        client_reference_id: result.data,
        customer: payload.customerId,
        metadata: {
          userId: payload.userInfo.userId,
        },
      };
      if (trialDays >= 1) {
        sessionPharams.subscription_data.trial_period_days = trialDays;
      }

      const session =
        await this.stripe.checkout.sessions.create(sessionPharams);

      return session.url;
    } catch (e) {
      this.logger.error(e, this.updateAutoPayment.name);
      return null;
    }
  }

  private getIntervalBySubType(typeSubscription: SubscriptionType) {
    let interval: Stripe.PriceCreateParams.Recurring.Interval;

    switch (typeSubscription) {
      case SubscriptionType.MONTHLY:
        interval = 'month';
        break;
      case SubscriptionType.WEEKLY:
        interval = 'week';
        break;
      case SubscriptionType.DAY:
        interval = 'day';
        break;
    }
    return interval;
  }

  private getTrialDays(currentSubDateEnd: Date): number {
    const future = new Date(currentSubDateEnd);
    future.setHours(0, 0, 0, 0);
    const current = new Date();
    current.setHours(0, 0, 0, 0);

    const differenceInMilliseconds = future.getTime() - current.getTime();
    const differenceInDays = Math.floor(
      differenceInMilliseconds / (1000 * 60 * 60 * 24),
    );

    return differenceInDays;
  }
}
