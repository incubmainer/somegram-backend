import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { AccountType } from '../../../../../../../libs/common/enums/payments';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { SubscriptionInfoGatewayType } from '../../domain/types';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { UserEntity } from '../../../users/domain/user.entity';

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
    private readonly publisher: EventPublisher,
  ) {
    this.logger.setContext(UpdateSubscriptionInfoUseCase.name);
  }

  async execute(
    command: UpdateSubscriptionInfoCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug(
      'Execute: Update account type for user command',
      this.execute.name,
    );
    const { userId, endDateOfSubscription } = command.payload;
    try {
      const user = await this.usersRepository.getUserById(userId);
      if (user) {
        const subscriptionExpireAt = new Date(endDateOfSubscription);

        if (subscriptionExpireAt > new Date()) {
          user.changeUserSubscription(
            subscriptionExpireAt,
            AccountType.Business,
          );
        } else {
          user.changeUserSubscription(null, AccountType.Personal);
        }
        await this.usersRepository.updateAccountType(user);
      }

      this.handleEvent(user);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private handleEvent(user: UserEntity): void {
    const userWithEvent = this.publisher.mergeObjectContext(user);
    if (user.accountType === AccountType.Business) {
      userWithEvent.changeAccountTypeToBusinessEvent();
    } else {
      userWithEvent.changeAccountTypeToPersonalEvent();
    }
    userWithEvent.commit();
  }
}
