import { Injectable } from '@nestjs/common';
import { PayPalEventsEnum } from './types/paypal/enum';
import { CommandBus } from '@nestjs/cqrs';
import { PayPalPaymentSucceededHandler } from '../../features/payments/application/handlers/paypal/paypal-payment-succeeded.handler';
import { IPayPalEventHandler } from '../interfaces/paypal-event-handler.interface';
import {
  ApplicationNotification,
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '@app/application-notification';
import { PayPalWebHookEventType } from './types/paypal/types';
import { PaypalSubscriptionActiveHandler } from '../../features/payments/application/handlers/paypal/paypal-subscription-active.handler';

@Injectable()
export class PaypalEventAdapter {
  private handlers: { [key: string]: IPayPalEventHandler<any> } = {};

  constructor(
    private readonly commandBus: CommandBus,
    private readonly payPalPaymentSucceededHandler: PayPalPaymentSucceededHandler,
    private readonly paypalSubscriptionActiveHandler: PaypalSubscriptionActiveHandler,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.handlers[PayPalEventsEnum.PAYMENT_COMPLETED] =
      this.payPalPaymentSucceededHandler;
    // this.handlers[PayPalEventsEnum.SUBSCRIPTION_ACTIVATED] =
    //   this.paypalSubscriptionActiveHandler;
  }

  async handleEvent<T>(data: any): Promise<AppNotificationResultType<null>> {
    const buffer = Buffer.from(data.data);
    const body: PayPalWebHookEventType<T> = JSON.parse(
      buffer.toString('utf-8'),
    );

    const event: PayPalEventsEnum = body.event_type;
    const handler: IPayPalEventHandler<T> = this.handlers[event];

    if (!handler) return this.appNotification.success(null);

    return await this.handlers[event].handle(body);
  }
}
