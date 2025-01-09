import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import { PaymentsRepository } from '../../features/payments/infrastructure/payments.repository';
import { GatewayServiceClientAdapter } from './gateway-service-client.adapter';
import { InvoicePaymentSucceededHandler } from '../../features/payments/application/handlers/invoice-payment-succeeded.handler';
import { InvoicePaymentFailedHandler } from '../../features/payments/application/handlers/invoice-payment-failed.handler';
import { SubscriptionUpdatedHandler } from '../../features/payments/application/handlers/subscription-updated.handler';
import { SubscriptionDeletedHandler } from '../../features/payments/application/handlers/subscription-deleted.handler';
import { IStripeEventHandler } from '../interfaces/stripe-event-handler.interface';
import { LoggerService } from '@app/logger';

@Injectable()
export class StripeEventAdapter {
  private handlers: { [key: string]: IStripeEventHandler } = {};

  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly gatewayServiceClientAdapter: GatewayServiceClientAdapter,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(StripeEventAdapter.name);
    this.handlers['invoice.payment_succeeded'] =
      new InvoicePaymentSucceededHandler(
        this.paymentsRepository,
        this.gatewayServiceClientAdapter,
      );
    this.handlers['invoice.payment_failed'] = new InvoicePaymentFailedHandler(
      this.paymentsRepository,
    );
    this.handlers['customer.subscription.updated'] =
      new SubscriptionUpdatedHandler(this.paymentsRepository);
    this.handlers['customer.subscription.deleted'] =
      new SubscriptionDeletedHandler(
        this.paymentsRepository,
        this.gatewayServiceClientAdapter,
      );
  }

  async handleEvent(event: Stripe.Event): Promise<void> {
    const handler = this.handlers[event.type];
    this.logger.debug(
      `Stripe handler: ${handler ? handler.constructor.name : 'unknown handler'}`,
      this.handleEvent.name,
    );
    if (handler) {
      await handler.handle(event);
    }
  }
}
