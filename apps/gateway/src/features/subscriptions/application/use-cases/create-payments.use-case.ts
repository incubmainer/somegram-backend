import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateSubscriptionDto } from '../../api/dto/input-dto/create-subscription.dto';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { PaymentsServiceAdapter } from '../../../../common/adapter/payment-service.adapter';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '../../../../../../../libs/application-notification/src';
import { LoggerService } from '@app/logger';

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
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(CreatePaymentUseCase.name);
  }

  async execute(
    command: CreatePaymentCommand,
  ): Promise<AppNotificationResultType<{ url: string }, null>> {
    try {
      const user = await this.usersQueryRepository.findUserById(command.userId);
      if (!user) {
        return this.appNotification.internalServerError();
      }
      const result = await this.paymentsServiceAdapter.createSubscription({
        userInfo: {
          userId: command.userId,
          email: user.email,
          userName: user.username,
        },
        createSubscriptionDto: command.createSubscriptionDto,
      });
      if (!result.data) {
        return this.appNotification.success(null);
      }
      return this.appNotification.success({ url: result.data });
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }
}
