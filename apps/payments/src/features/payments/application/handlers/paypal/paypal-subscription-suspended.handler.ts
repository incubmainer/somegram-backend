import { Inject, Injectable } from '@nestjs/common';
import { IPayPalEventHandler } from '../../../../../common/interfaces/paypal-event-handler.interface';
import {
  PayPalWebHookEventType,
  WHSubscriptionSuspendedType,
} from '../../../../../common/adapters/types/paypal/types';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { Subscription } from '@prisma/payments';
import { SubscriptionEntity } from '../../../domain/subscription.entity';
import { LoggerService } from '@app/logger';
import { SubscriptionStatuses } from '../../../../../common/enum/subscription-types.enum';

@Injectable()
export class PaypalSubscriptionSuspendedHandler
  implements
    IPayPalEventHandler<PayPalWebHookEventType<WHSubscriptionSuspendedType>>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appNotification: ApplicationNotification,
    @Inject(SubscriptionEntity.name)
    private readonly subscriptionEntity: typeof SubscriptionEntity,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PaypalSubscriptionSuspendedHandler.name);
  }

  // TODO Блокировка
  async handle(
    event: PayPalWebHookEventType<WHSubscriptionSuspendedType>,
  ): Promise<AppNotificationResultType<null>> {
    try {
      this.logger.debug('Execute: suspend use-cases handler', this.handle.name);
      const { id } = event.resource;

      const subscription: Subscription | null =
        await this.paymentsRepository.getSubscriptionByPaymentSystemSubId(id);

      if (!subscription) return this.appNotification.notFound();
      if (
        subscription.status === SubscriptionStatuses.Suspended &&
        !subscription.autoRenewal
      )
        return this.appNotification.success(null);

      this.subscriptionEntity.suspendSubscription(subscription);
      await this.paymentsRepository.updateSub(subscription);

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.handle.name);
      return this.appNotification.internalServerError();
    }
  }
}
