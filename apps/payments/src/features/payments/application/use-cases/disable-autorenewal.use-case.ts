import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';

import { PaymentsRepository } from '../../infrastructure/payments.repository';
import { PaymentSystem } from '../../../../../../../libs/common/enums/payments';
import { PaymentsService } from '../../api/payments.service';

export class DisableAutoRenewalCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DisableAutoRenewalCommand)
export class DisableAutoRenewalUseCase
  implements ICommandHandler<DisableAutoRenewalCommand>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly paymentsService: PaymentsService,
  ) {}

  async execute(command: DisableAutoRenewalCommand) {
    const activeSubscription =
      await this.paymentsRepository.getSubscriptionByUserId(command.userId);

    if (!activeSubscription) {
      return null;
    }

    try {
      const result = await this.paymentsService.disableAutoRenewal(
        activeSubscription.paymentSystem as PaymentSystem,
        activeSubscription.paymentSystemSubId,
      );

      return result;
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException();
    }
  }
}
