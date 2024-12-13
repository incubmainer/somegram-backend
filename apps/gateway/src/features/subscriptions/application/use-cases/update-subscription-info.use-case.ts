import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  AccountType,
  SubscriptionDto,
} from '../../../../../../../libs/common/enums/payments';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

export class UpdateSubscriptionInfoCommand {
  constructor(public payload: SubscriptionDto) {}
}

@CommandHandler(UpdateSubscriptionInfoCommand)
export class UpdateSubscriptionInfoUseCase
  implements ICommandHandler<UpdateSubscriptionInfoCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: UpdateSubscriptionInfoCommand) {
    const { userId, endDateOfSubscription, status, autoRenewal } =
      command.payload;
    try {
      const user = await this.usersRepository.getUserById(userId);
      if (user) {
        const subscriptionExpireAt = new Date(endDateOfSubscription);

        if (subscriptionExpireAt > new Date()) {
          user.subscriptionExpireAt = subscriptionExpireAt;
          user.accountType = AccountType.Business;
          //user.autoRenewal = autoRenewal;
        } else {
          user.subscriptionExpireAt = null;
          user.accountType = AccountType.Personal;
          //user.autoRenewal = autoRenewal;
        }
        await this.usersRepository.updateUserProfileInfo(user.id, user);
      }
    } catch (e) {
      console.error(e);
    }
  }
}
