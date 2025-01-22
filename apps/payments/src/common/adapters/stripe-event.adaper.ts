import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { LoggerService } from '@app/logger';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';

import { StripeInvoicePaymentSucceededHandler } from '../../features/payments/application/handlers/stripe/stripe-invoice-payment-succeeded.handler';
import { StripeInvoicePaymentFailedHandler } from '../../features/payments/application/handlers/stripe/stripe-invoice-payment-failed.handler';
import { StripeSubscriptionDeletedHandler } from '../../features/payments/application/handlers/stripe/stripe-subscription-deleted.handler';
import { IStripeEventHandler } from '../interfaces/stripe-event-handler.interface';
import { StripeCheckouSessionCompletedHandler } from '../../features/payments/application/handlers/stripe/stripe-checkout-session-completed.handler';
import { StripeEventsEnum } from './types/stripe/enum';

@Injectable()
export class StripeEventAdapter {
  private handlers: { [key: string]: IStripeEventHandler } = {};

  constructor(
    private readonly logger: LoggerService,
    private readonly invoicePaymentFailedHandler: StripeInvoicePaymentFailedHandler,
    private readonly invoicePaymentSucceededHandler: StripeInvoicePaymentSucceededHandler,
    private readonly checkouSessionCompletedHandler: StripeCheckouSessionCompletedHandler,
    private readonly subscriptionDeletedHandler: StripeSubscriptionDeletedHandler,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(StripeEventAdapter.name);
    this.handlers[StripeEventsEnum.PAYMENT_SUCCEEDED] =
      this.invoicePaymentSucceededHandler;
    this.handlers[StripeEventsEnum.PAYMENT_FAILED] =
      this.invoicePaymentFailedHandler;
    this.handlers[StripeEventsEnum.SUB_DELETED] =
      this.subscriptionDeletedHandler;
    this.handlers[StripeEventsEnum.SESSION_COMPLETED] =
      this.checkouSessionCompletedHandler;
  }

  async handleEvent(
    event: Stripe.Event,
  ): Promise<AppNotificationResultType<null>> {
    const handler = this.handlers[event.type];
    this.logger.debug(
      `Stripe handler: ${handler ? handler.constructor.name : 'unknown handler'}`,
      this.handleEvent.name,
    );
    if (!handler) return this.appNotification.success(null);
    if (handler) {
      await handler.handle(event);
    }
  }
}
