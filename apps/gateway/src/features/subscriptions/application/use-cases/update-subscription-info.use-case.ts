import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateSync, ValidationError } from 'class-validator';
import { UnauthorizedException } from '@nestjs/common';

import { CreateSubscriptionDto } from '../../api/dto/input-dto/create-subscription.dto';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { NotificationObject } from '../../../../common/domain/notification';
import { PaymentsServiceAdapter } from '../../../../common/adapter/payment-service.adapter';

export const CreatePaymentCodes = {
  Success: Symbol('success'),
  ValidationCommandError: Symbol('validationError'),
  TransactionError: Symbol('transactionError'),
};

export class UpdateSubscriptionInfoCommand {
  constructor(public payload: any) {}
}

@CommandHandler(UpdateSubscriptionInfoCommand)
export class UpdateSubscriptionInfoUseCase
  implements ICommandHandler<UpdateSubscriptionInfoCommand>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly paymentsServiceAdapter: PaymentsServiceAdapter,
  ) {}

  async execute(command: UpdateSubscriptionInfoCommand) {
    try {
    } catch (e) {
      console.error(e);
    }
    return null;
  }
}
