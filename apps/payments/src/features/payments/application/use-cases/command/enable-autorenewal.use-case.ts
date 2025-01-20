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

export class EnableAutoRenewalCommand {
  constructor(public userId: string) {}
}

// TODO Нужно делать с блокировкой
// TODO Установка статусов сразу не дожидаясь хука от платежной системы
@CommandHandler(EnableAutoRenewalCommand)
export class EnableAutoRenewalUseCase
  implements
    ICommandHandler<EnableAutoRenewalCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly paymentManager: PaymentManager,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(EnableAutoRenewalUseCase.name);
  }

  async execute(
    command: EnableAutoRenewalCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: enable auto renewal', this.execute.name);
    try {
      const activeSubscription: Subscription | null =
        await this.paymentsRepository.getActiveSubscriptionByUserId(
          command.userId,
        );

      if (!activeSubscription) return this.appNotification.notFound();

      if (activeSubscription.autoRenewal)
        return this.appNotification.success(null);

      const result: boolean = await this.paymentManager.enableAutoRenewal(
        activeSubscription.paymentSystem as PaymentSystem,
        activeSubscription.paymentSystemSubId,
      );

      if (!result) return this.appNotification.internalServerError();

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
