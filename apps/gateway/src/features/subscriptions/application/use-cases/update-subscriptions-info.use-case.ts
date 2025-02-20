import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AccountType } from '../../../../../../../libs/common/enums/payments';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { SubscriptionInfoGatewayType } from '../../domain/types';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';

export class UpdateSubscriptionsInfoCommand {
  constructor(public payload: SubscriptionInfoGatewayType[]) {}
}

@CommandHandler(UpdateSubscriptionsInfoCommand)
export class UpdateSubscriptionsInfoUseCase
  implements
    ICommandHandler<
      UpdateSubscriptionsInfoCommand,
      AppNotificationResultType<null>
    >
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UpdateSubscriptionsInfoUseCase.name);
  }

  async execute(
    command: UpdateSubscriptionsInfoCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: Update accounts type', this.execute.name);
    try {
      const ids: string[] = command.payload.map(
        (u: SubscriptionInfoGatewayType) => u.userId,
      );
      // @ts-ignore TODO:
      const users = await this.usersRepository.getUsersById(ids);
      if (!users) return this.appNotification.success(null);

      const userMap = new Map(users.map((user) => [user.id, user]));

      for (const payloadItem of command.payload) {
        const { userId, endDateOfSubscription } = payloadItem;
        const user = userMap.get(userId);

        if (!user) continue;

        const subscriptionExpireAt = new Date(endDateOfSubscription);

        if (subscriptionExpireAt > new Date()) {
          // @ts-ignore TODO:
          user.subscriptionExpireAt = subscriptionExpireAt;
          // @ts-ignore TODO:
          user.accountType = AccountType.Business;
        } else {
          // @ts-ignore TODO:
          user.subscriptionExpireAt = null;
          // @ts-ignore TODO:
          user.accountType = AccountType.Personal;
        }
      }

      // @ts-ignore TODO:
      await this.usersRepository.updateManyUsers(Array.from(userMap.values()));

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
