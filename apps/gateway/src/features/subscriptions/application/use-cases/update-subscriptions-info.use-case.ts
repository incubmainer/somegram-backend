import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { AccountType } from '../../../../../../../libs/common/enums/payments';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { SubscriptionInfoGatewayType } from '../../domain/types';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { Transactional } from '@nestjs-cls/transactional';
import { UserEntity } from '../../../users/domain/user.entity';

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
    private readonly publisher: EventPublisher,
  ) {
    this.logger.setContext(UpdateSubscriptionsInfoUseCase.name);
  }

  async execute(
    command: UpdateSubscriptionsInfoCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug(
      'Execute: Update accounts type for users command',
      this.execute.name,
    );
    try {
      const ids: string[] = command.payload.map(
        (u: SubscriptionInfoGatewayType) => u.userId,
      );
      const users = await this.usersRepository.getUsersByIds(ids);
      if (!users) return this.appNotification.success(null);

      const userMap = new Map(users.map((user) => [user.id, user]));

      for (const payloadItem of command.payload) {
        const { userId, endDateOfSubscription } = payloadItem;
        const user = userMap.get(userId);

        if (!user) continue;

        const subscriptionExpireAt = new Date(endDateOfSubscription);

        if (subscriptionExpireAt > new Date()) {
          user.changeUserSubscription(
            subscriptionExpireAt,
            AccountType.Business,
          );
        } else {
          user.changeUserSubscription(null, AccountType.Personal);
        }
      }
      await this.handleUsers(Array.from(userMap.values()));

      this.handleEvents(Array.from(userMap.values()));
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  @Transactional()
  private async handleUsers(users: UserEntity[]): Promise<void> {
    const promises = users.map((user) => {
      return this.usersRepository.updateAccountType(user);
    });

    await Promise.all(promises);
  }

  private handleEvents(users: UserEntity[]): void {
    for (const user of users) {
      const userWithEvent = this.publisher.mergeObjectContext(user);
      if (user.accountType === AccountType.Business) {
        userWithEvent.changeAccountTypeToBusinessEvent();
      } else {
        userWithEvent.changeAccountTypeToPersonalEvent();
      }
      userWithEvent.commit();
    }
  }
}
