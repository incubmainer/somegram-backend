import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AccountType } from '../../../../../../../libs/common/enums/payments';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { SubscriptionInfoGatewayType } from '../../domain/types';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';

export class UpdateSubscriptionInfoCommand {
  constructor(public payload: SubscriptionInfoGatewayType) {}
}

@CommandHandler(UpdateSubscriptionInfoCommand)
export class UpdateSubscriptionInfoUseCase
  implements
    ICommandHandler<
      UpdateSubscriptionInfoCommand,
      AppNotificationResultType<null>
    >
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UpdateSubscriptionInfoUseCase.name);
  }

  async execute(
    command: UpdateSubscriptionInfoCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: Update account type', this.execute.name);
    const { userId, endDateOfSubscription } = command.payload;
    try {
      const user = await this.usersRepository.getUserById(userId);
      if (user) {
        const subscriptionExpireAt = new Date(endDateOfSubscription);

        if (subscriptionExpireAt > new Date()) {
          user.accountType = AccountType.Business;
        } else {
          user.accountType = AccountType.Personal;
        }
        await this.usersRepository.updateUserProfileInfo(user.id, user);
      }
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
