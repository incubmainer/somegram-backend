import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { PaymentSystem } from '../../../../../../../../libs/common/enums/payments';
import { PaymentsService } from '../../../api/payments.service';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { Subscription } from '@prisma/payments';

export class DisableAutoRenewalCommand {
  constructor(public userId: string) {}
}

// TODO Нужно делать с блокировкой
// TODO Установка статуса Suspend для PAYPAL и для STRIPE?
//  TODO принудительно независимо от платежной системы тоесть сразу после того как успешно отключили автоплатежи в платежной системе ставить autorenewal false и status SUSPEND?
@CommandHandler(DisableAutoRenewalCommand)
export class DisableAutoRenewalUseCase
  implements
    ICommandHandler<DisableAutoRenewalCommand, AppNotificationResultType<null>>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly paymentsService: PaymentsService,
    private readonly appNotification: ApplicationNotification,
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
        await this.paymentsRepository.getActiveSubscriptionByUserId(
          command.userId,
        );

      if (!activeSubscription) return this.appNotification.notFound();

      if (!activeSubscription.autoRenewal)
        return this.appNotification.success(null);

      const result: boolean = await this.paymentsService.disableAutoRenewal(
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
