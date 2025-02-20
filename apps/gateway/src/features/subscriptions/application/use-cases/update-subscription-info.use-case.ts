import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AccountType } from '../../../../../../../libs/common/enums/payments';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { SubscriptionInfoGatewayType } from '../../domain/types';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { User } from '@prisma/gateway';
import { SendEmailNotificationSubscriptionActivatedEvent } from '../../../notification/application/event/send-email-notification-subscription-activated.event';
import { SendEmailNotificationSubscriptionDisabledEvent } from '../../../notification/application/event/send-email-notification-subscription-disabled.event';

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
    private readonly eventBus: EventBus,
  ) {
    this.logger.setContext(UpdateSubscriptionInfoUseCase.name);
  }

  async execute(
    command: UpdateSubscriptionInfoCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: Update account type', this.execute.name);
    const { userId, endDateOfSubscription } = command.payload;
    try {
      // @ts-ignore TODO:
      const user = await this.usersRepository.getUserById(userId);
      if (user) {
        const subscriptionExpireAt = new Date(endDateOfSubscription);

        if (subscriptionExpireAt > new Date()) {
          user.subscriptionExpireAt = subscriptionExpireAt;
          user.accountType = AccountType.Business;
        } else {
          user.subscriptionExpireAt = null;
          user.accountType = AccountType.Personal;
        }
        // @ts-ignore TODO:
        await this.usersRepository.updateUserProfileInfo(user.id, user);
      }

      this.handleEvent(user);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private handleEvent(user: User): void {
    console.log('handle event', user);
    if (user.accountType === AccountType.Business) {
      this.eventBus.publish(
        new SendEmailNotificationSubscriptionActivatedEvent(
          user.email,
          user.subscriptionExpireAt,
        ),
      );
    } else {
      this.eventBus.publish(
        new SendEmailNotificationSubscriptionDisabledEvent(user.email),
      );
    }
  }
}
