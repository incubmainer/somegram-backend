import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { CreateSubscriptionDto } from '../../api/dto/input-dto/subscriptions.dto';
import { UsersQueryRepository } from '../../../users/infrastructure/users.query-repository';
import { PaymentsServiceAdapter } from '../../../../common/adapter/payment-service.adapter';
import {
  ApplicationNotification,
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '../../../../../../../libs/application-notification/src';
import { LoggerService } from '@app/logger';
import { User } from '@prisma/gateway';
import { CreatePaymentDto, UserInfoModel } from '../../domain/types';
import { PaymentCreatedOutputDto } from '../../api/dto/output-dto/subscriptions.output-dto';

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
  ): Promise<AppNotificationResultType<PaymentCreatedOutputDto>> {
    try {
      const user: User | null = await this.usersQueryRepository.findUserById(
        command.userId,
      );
      if (!user) {
        return this.appNotification.internalServerError();
      }

      const payload: CreatePaymentDto = {
        userInfo: this.generateUserInfoData(user),
        createSubscriptionDto: command.createSubscriptionDto,
      };
      const result: AppNotificationResultType<string> =
        await this.paymentsServiceAdapter.createSubscription(payload);

      if (result.appResult !== AppNotificationResultEnum.Success) {
        return this.appNotification.success(null); // TODO Error
      }

      return this.appNotification.success({ url: result.data });
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private generateUserInfoData(user: User): UserInfoModel {
    return {
      userId: user.id,
      email: user.email,
      userName: user.username,
    };
  }
}
