import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { LoggerService } from '@app/logger';
import { Subscription } from '@prisma/payments';

import { PaymentsRepository } from '../../../infrastructure/payments.repository';

export class UpdateUsernameAfterChangeCommand {
  constructor(
    public userId: string,
    public newUsername: string,
  ) {}
}

@CommandHandler(UpdateUsernameAfterChangeCommand)
export class UpdateUsernameAfterChangeUseCase
  implements
    ICommandHandler<
      UpdateUsernameAfterChangeCommand,
      AppNotificationResultType<null>
    >
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UpdateUsernameAfterChangeUseCase.name);
  }

  async execute(
    command: UpdateUsernameAfterChangeCommand,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug(
      'Execute: update username after change',
      this.execute.name,
    );
    try {
      const activeSubscription: Subscription | null =
        await this.paymentsRepository.getActiveSubscriptionByUserId(
          command.userId,
        );

      if (!activeSubscription) return this.appNotification.notFound();

      activeSubscription.username = command.newUsername;

      await this.paymentsRepository.updateSub(activeSubscription);

      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
