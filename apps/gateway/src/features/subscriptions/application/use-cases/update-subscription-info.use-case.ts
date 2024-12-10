import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  AccountType,
  SubscriptionDto,
} from '../../../../../../../libs/common/enums/payments';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import {
  InjectCustomLoggerService,
  CustomLoggerService,
  LogClass,
} from '../../../../../../../libs/custom-logger/src';
import { AddPostUseCase } from '../../../posts/application/use-cases/add-post.use-case';

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
    //console.log(command.payload);

    const user = await this.usersRepository.getUserById(userId);
    //console.log(user);
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

    return true;
  }
}
