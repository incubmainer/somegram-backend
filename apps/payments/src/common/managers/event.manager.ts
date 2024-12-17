import { Injectable } from '@nestjs/common';
import { PaymentSystem } from '../../../../../libs/common/enums/payments';
import { PayPalEventsEnum } from '../adapters/types/paypal/enum';
import { PayPalWebHookEventType } from '../adapters/types/paypal/types';
import { CommandBus } from '@nestjs/cqrs';

@Injectable()
export class EventManager {
  constructor(private readonly commandBus: CommandBus) {}

  async handleEvent(system: string, data: any) {
    try {
      const buffer = Buffer.from(data.data);
      const body = JSON.parse(buffer.toString('utf-8'));

      console.log(body);

      return await this.paypalEventManager(body);
      // if (system === PaymentSystem.PAYPAL) {
      //   return await this.paypalEventManager(event, data);
      // } else {
      //   return await this.stripeEventManager();
      // }
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return null;
    }
  }

  private async paypalEventManager<T>(
    data: PayPalWebHookEventType<T>,
  ): Promise<void> {
    const event: PayPalEventsEnum = data.event_type;
    switch (event) {
      case PayPalEventsEnum.SUBSCRIPTION_CREATED:
        return;
      case PayPalEventsEnum.SUBSCRIPTION_ACTIVATED:
        return;
      case PayPalEventsEnum.SUBSCRIPTION_UPDATED:
        return;
      case PayPalEventsEnum.SUBSCRIPTION_FAILED:
        return;
      case PayPalEventsEnum.SUBSCRIPTION_CANCELLED:
        return;
      case PayPalEventsEnum.SUBSCRIPTION_EXPIRED:
        return;
      case PayPalEventsEnum.SUBSCRIPTION_SUSPENDED:
        return;
      case PayPalEventsEnum.PAYMENT_COMPLETED:
        return;
      case PayPalEventsEnum.PAYMENT_REVERSED:
        return;
      case PayPalEventsEnum.PAYMENT_REFUNDED:
        return;
      default:
        return;
    }
  }

  private async stripeEventManager() {}
}
