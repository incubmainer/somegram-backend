import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';

import { PaymentsRepository } from '../../infrastructure/payments.repository';
import { PaymentSystem } from '../../../../../../../libs/common/enums/payments';
import { PaymentsService } from '../../api/payments.service';

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
  ) {}

  async execute(command: EnableAutoRenewalCommand) {
    const activeSubscription =
      await this.paymentsRepository.getSubscriptionByUserId(command.userId);

    if (!activeSubscription) {
      return null;
    }
    try {
      const result = await this.paymentsService.enableAutoRenewal(
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
