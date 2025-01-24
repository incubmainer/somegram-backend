import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { PaymentSystem } from '../../../../../../../../libs/common/enums/payments';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { Subscription } from '@prisma/payments';
import { PaymentManager } from '../../../../../common/managers/payment.manager';
import { SubscriptionEntity } from '../../../domain/subscription.entity';
import { Inject } from '@nestjs/common';

export class DisableAutoRenewalCommand {
  constructor(public userId: string) {}
}

// TODO Блокировка
@CommandHandler(DisableAutoRenewalCommand)
export class DisableAutoRenewalUseCase
  implements
    ICommandHandler<DisableAutoRenewalCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly paymentManager: PaymentManager,
    private readonly appNotification: ApplicationNotification,
    @Inject(SubscriptionEntity.name)
    private readonly subscriptionEntity: typeof SubscriptionEntity,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(DisableAutoRenewalUseCase.name);
  }

  async execute(
    command: DisableAutoRenewalCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: disable auto renewal', this.execute.name);
    try {
      const activeSubscription: Subscription | null =
        await this.paymentsRepository.getActiveSubscriptionByUserIdWithPayments(
          command.userId,
        );

      if (!activeSubscription) return this.appNotification.notFound();

      if (!activeSubscription.autoRenewal)
        return this.appNotification.success(null);

      const result: boolean = await this.paymentManager.disableAutoRenewal(
        activeSubscription.paymentSystem as PaymentSystem,
        activeSubscription.paymentSystemSubId,
      );

      if (!result) return this.appNotification.internalServerError();

      await this.handleDisable(activeSubscription);

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private async handleDisable(subscription: Subscription): Promise<void> {
    switch (subscription.paymentSystem) {
      case PaymentSystem.PAYPAL:
        this.subscriptionEntity.suspendSubscription(subscription);
        break;
      case PaymentSystem.STRIPE:
        this.subscriptionEntity.disableAutoRenewal(subscription);
        break;
    }
    await this.paymentsRepository.updateSub(subscription);
  }
}
