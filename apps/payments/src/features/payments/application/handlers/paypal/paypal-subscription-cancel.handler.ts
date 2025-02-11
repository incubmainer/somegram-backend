import { Inject, Injectable } from '@nestjs/common';
import { IPayPalEventHandler } from '../../../../../common/interfaces/paypal-event-handler.interface';
import {
  PayPalWebHookEventType,
  WHSubscriptionCancelledType,
} from '../../../../../common/adapters/types/paypal/types';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { Subscription } from '@prisma/payments';
import { SubscriptionEntity } from '../../../domain/subscription.entity';
import { LoggerService } from '@app/logger';
import { GatewayServiceClientAdapter } from '../../../../../common/adapters/gateway-service-client.adapter';
import { SubscriptionStatuses } from '../../../../../common/enum/subscription-types.enum';

@Injectable()
export class PaypalSubscriptionCancelHandler
  implements
    IPayPalEventHandler<PayPalWebHookEventType<WHSubscriptionCancelledType>>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appNotification: ApplicationNotification,
    @Inject(SubscriptionEntity.name)
    private readonly subscriptionEntity: typeof SubscriptionEntity,
    private readonly gatewayServiceClientAdapter: GatewayServiceClientAdapter,

    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PaypalSubscriptionCancelHandler.name);
  }

  // TODO Блокировка
  async handle(
    event: PayPalWebHookEventType<WHSubscriptionCancelledType>,
  ): Promise<AppNotificationResultType<null>> {
    try {
      this.logger.debug(
        'Execute: cancel paypal subscription',
        this.handle.name,
      );
      const { id } = event.resource;

      const subscription: Subscription | null =
        await this.paymentsRepository.getSubscriptionByPaymentSystemSubId(id);

      if (!subscription) return this.appNotification.notFound();
      if (subscription.status === SubscriptionStatuses.Canceled)
        return this.appNotification.success(null);

      this.subscriptionEntity.cancelSubscription(subscription);

      await this.paymentsRepository.updateSub(subscription);

      this.gatewayServiceClientAdapter.sendSubscriptionInfo({
        userId: subscription.userId,
        endDateOfSubscription: subscription.endDateOfSubscription,
      });
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.handle.name);
      return this.appNotification.internalServerError();
    }
  }
}
