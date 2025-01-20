import { Injectable } from '@nestjs/common';
import { PaymentSystem } from '../../../../../libs/common/enums/payments';
import { PaymentData } from '../../features/payments/application/types/payment-data.type';
import { StripeAdapter } from '../adapters/stripe.adapter';
import { PayPalAdapter } from '../adapters/paypal.adapter';
import { LoggerService } from '@app/logger';

@Injectable()
export class PaymentManager {
  constructor(
    private readonly stripeAdapter: StripeAdapter,
    private readonly payPalAdapter: PayPalAdapter,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PaymentManager.name);
  }

  async createAutoPayment(payment: PaymentData): Promise<string | null> {
    this.logger.debug(
      'Execute: create auto payment',
      this.createAutoPayment.name,
    );
    switch (payment.paymentSystem) {
      case PaymentSystem.PAYPAL:
        this.logger.debug('PayPal system', this.createAutoPayment.name);
        return await this.payPalAdapter.createAutoPayment(payment);
      case PaymentSystem.STRIPE:
        this.logger.debug('Stripe system', this.createAutoPayment.name);
        return await this.stripeAdapter.createAutoPayment(payment);
      default:
        this.logger.debug('Unknown system', this.createAutoPayment.name);
        return;
    }
  }

  async updateCurrentSub(payment: PaymentData): Promise<string> {
    this.logger.debug(
      'Execute: update subscription',
      this.updateCurrentSub.name,
    );
    switch (payment.paymentSystem) {
      case PaymentSystem.PAYPAL:
        this.logger.debug('PayPal system', this.updateCurrentSub.name);
        return await this.payPalAdapter.updateAutoPayment(payment);
      case PaymentSystem.STRIPE:
        this.logger.debug('Stripe system', this.updateCurrentSub.name);
        return await this.stripeAdapter.updateAutoPayment(payment);
      default:
        this.logger.debug('Unknown system', this.updateCurrentSub.name);
        return;
    }
  }
  async disableAutoRenewal(
    paymentSystem: PaymentSystem,
    paymentSubscriptionSubId: string,
  ): Promise<boolean> {
    this.logger.debug(
      'Execute: disable auto renewal',
      this.disableAutoRenewal.name,
    );

    switch (paymentSystem) {
      case PaymentSystem.PAYPAL:
        this.logger.debug('PayPal system', this.disableAutoRenewal.name);
        return await this.payPalAdapter.disableAutoRenewal(
          paymentSubscriptionSubId,
        );
      case PaymentSystem.STRIPE:
        this.logger.debug('Stripe system', this.disableAutoRenewal.name);
        return await this.stripeAdapter.disableAutoRenewal(
          paymentSubscriptionSubId,
        );
      default:
        this.logger.debug('Unknown system', this.disableAutoRenewal.name);
        return false;
    }
  }

  async enableAutoRenewal(
    paymentSystem: PaymentSystem,
    paymentSubscriptionSubId: string,
  ): Promise<boolean> {
    this.logger.debug(
      'Execute: enable auto renewal',
      this.enableAutoRenewal.name,
    );

    switch (paymentSystem) {
      case PaymentSystem.PAYPAL:
        this.logger.debug('PayPal system', this.enableAutoRenewal.name);
        return await this.payPalAdapter.enableAutoRenewal(
          paymentSubscriptionSubId,
        );
      case PaymentSystem.STRIPE:
        this.logger.debug('Stripe system', this.enableAutoRenewal.name);
        return await this.stripeAdapter.enableAutoRenewal(
          paymentSubscriptionSubId,
        );
      default:
        this.logger.debug('Unknown system', this.enableAutoRenewal.name);
        return false;
    }
  }

  async cancelSubscription(
    paymentSystem: PaymentSystem,
    paymentSubscriptionSubId: string,
  ): Promise<boolean> {
    switch (paymentSystem) {
      case PaymentSystem.PAYPAL:
        this.logger.debug('PayPal system', this.cancelSubscription.name);
        return await this.payPalAdapter.cancelSubscription(
          paymentSubscriptionSubId,
        );
      case PaymentSystem.STRIPE:
        this.logger.debug('Stripe system', this.cancelSubscription.name);
        return await this.stripeAdapter.cancelSubscription(
          paymentSubscriptionSubId,
        );
      default:
        this.logger.debug('Unknown system', this.cancelSubscription.name);
        return false;
    }
  }
}
