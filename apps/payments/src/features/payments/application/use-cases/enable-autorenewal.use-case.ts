import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PaymentsRepository } from '../../infrastructure/payments.repository';
import { PaymentSystem } from '../../../../../../../libs/common/enums/payments';
import { PaymentsService } from '../../api/payments.service';
import { ApplicationNotification } from '@app/application-notification';
import { SubscriptionStatuses } from '../../../../common/enum/transaction-statuses.enum';

export class EnableAutoRenewalCommand {
  constructor(public userId: string) {}
}

@CommandHandler(EnableAutoRenewalCommand)
export class EnableAutoRenewalUseCase
  implements ICommandHandler<EnableAutoRenewalCommand>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly paymentsService: PaymentsService,
    private readonly appNotification: ApplicationNotification,
  ) {}

  async execute(command: EnableAutoRenewalCommand) {
    const activeSubscription =
      await this.paymentsRepository.getSubscriptionByUserId(command.userId);

    if (!activeSubscription) {
      return this.appNotification.notFound();
    }
    try {
      if (activeSubscription.status !== SubscriptionStatuses.Canceled) {
        const result = await this.paymentsService.enableAutoRenewal(
          activeSubscription.paymentSystem as PaymentSystem,
          activeSubscription.paymentSystemSubId,
        );

        return this.appNotification.success(result);
      } else {
        return this.appNotification.notFound();
      }
    } catch (e) {
      console.error(e);
      return this.appNotification.internalServerError();
    }
  }
}
