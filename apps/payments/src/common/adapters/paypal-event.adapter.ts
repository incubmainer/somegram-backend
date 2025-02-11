import { Injectable } from '@nestjs/common';
import { PayPalEventsEnum } from './types/paypal/enum';
import { PayPalPaymentSucceededHandler } from '../../features/payments/application/handlers/paypal/paypal-payment-succeeded.handler';
import { IPayPalEventHandler } from '../interfaces/paypal-event-handler.interface';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { PayPalWebHookEventType } from './types/paypal/types';
import { PaypalSubscriptionActiveHandler } from '../../features/payments/application/handlers/paypal/paypal-subscription-active.handler';
import { PaypalSubscriptionSuspendedHandler } from '../../features/payments/application/handlers/paypal/paypal-subscription-suspended.handler';
import { PaypalSubscriptionCancelHandler } from '../../features/payments/application/handlers/paypal/paypal-subscription-cancel.handler';
import { LoggerService } from '@app/logger';
import { PayPalPaymentFailedHandler } from '../../features/payments/application/handlers/paypal/paypal-payment-failed.handler';

@Injectable()
export class PaypalEventAdapter {
  private handlers: { [key: string]: IPayPalEventHandler<any> } = {};

  constructor(
    private readonly payPalPaymentSucceededHandler: PayPalPaymentSucceededHandler,
    private readonly paypalSubscriptionActiveHandler: PaypalSubscriptionActiveHandler,
    private readonly paypalSubscriptionSuspendedHandler: PaypalSubscriptionSuspendedHandler,
    private readonly paypalSubscriptionCancelHandler: PaypalSubscriptionCancelHandler,
    private readonly payPalPaymentFailedHandler: PayPalPaymentFailedHandler,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PaypalEventAdapter.name);
    this.handlers[PayPalEventsEnum.PAYMENT_COMPLETED] =
      this.payPalPaymentSucceededHandler;
    this.handlers[PayPalEventsEnum.SUBSCRIPTION_SUSPENDED] =
      this.paypalSubscriptionSuspendedHandler;
    this.handlers[PayPalEventsEnum.SUBSCRIPTION_ACTIVATED] =
      this.paypalSubscriptionActiveHandler;
    this.handlers[PayPalEventsEnum.SUBSCRIPTION_CANCELLED] =
      this.paypalSubscriptionCancelHandler;
    this.handlers[PayPalEventsEnum.SUBSCRIPTION_FAILED] =
      this.payPalPaymentFailedHandler;
  }

  async handleEvent<T>(data: any): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: handle event', this.handleEvent.name);
    const buffer = Buffer.from(data.data);
    const body: PayPalWebHookEventType<T> = JSON.parse(
      buffer.toString('utf-8'),
    );

    const event: PayPalEventsEnum = body.event_type;
    const handler: IPayPalEventHandler<T> = this.handlers[event];
    this.logger.debug(
      `PayPal handler: ${handler ? handler.constructor.name : 'unknown handler'}`,
      this.handleEvent.name,
    );

    if (!handler) return this.appNotification.success(null);

    return await this.handlers[event].handle(body);
  }
}
