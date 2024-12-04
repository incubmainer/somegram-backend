import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';

import { PaymentsRepository } from '../../infrastructure/payments.repository';

export class GetPaymentsQuery {
  constructor(public userId: string) {}
}

@CommandHandler(GetPaymentsQuery)
export class GetPaymentsQueryUseCase
  implements ICommandHandler<GetPaymentsQuery>
{
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  async execute(command: GetPaymentsQuery) {
    try {
      const result = await this.paymentsRepository.getPaymentsByUserId(
        command.userId,
      );

      return result;
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException();
    }
  }
}
