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

export class CreatePaymentCommand {
  constructor(
    public userId: string,
    public createSubscriptionDto: CreateSubscriptionDto,
  ) {}
}

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentUseCase
  implements ICommandHandler<CreatePaymentCommand>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly paymentsServiceAdapter: PaymentsServiceAdapter,
  ) {}

  async execute(command: CreatePaymentCommand) {
    const errors = validateSync(command);
    if (errors.length) {
      const note = new NotificationObject<null, ValidationError>(
        CreatePaymentCodes.ValidationCommandError,
      );
      note.addErrors(errors);
      return note;
    }
    const notification = new NotificationObject<string>(
      CreatePaymentCodes.Success,
    );
    try {
      const user = await this.usersQueryRepository.findUserById(command.userId);
      if (!user) {
        throw new UnauthorizedException();
      }
      const result = await this.paymentsServiceAdapter.createSubscription({
        userId: command.userId,
        createSubscriptionDto: command.createSubscriptionDto,
      });
      notification.setData(result);
    } catch (e) {
      console.error(e);
      notification.setCode(CreatePaymentCodes.TransactionError);
    }
    return notification;
  }
}
