import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateSubscriptionDto } from '../../api/dto/input-dto/subscriptions.dto';
import { PaymentsServiceAdapter } from '../../../../common/adapter/payment-service.adapter';
import {
  ApplicationNotification,
  AppNotificationResultEnum,
  AppNotificationResultType,
} from '../../../../../../../libs/application-notification/src';
import { LoggerService } from '@app/logger';
import { CreatePaymentDto, UserInfoModel } from '../../domain/types';
import { PaymentCreatedOutputDto } from '../../api/dto/output-dto/subscriptions.output-dto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UserEntity } from '../../../users/domain/user.entity';

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
    private readonly usersRepository: UsersRepository,
    private readonly paymentsServiceAdapter: PaymentsServiceAdapter,
    private readonly logger: LoggerService,
    private readonly appNotification: ApplicationNotification,
  ) {
    this.logger.setContext(CreatePaymentUseCase.name);
  }

  async execute(
    command: CreatePaymentCommand,
  ): Promise<AppNotificationResultType<PaymentCreatedOutputDto>> {
    this.logger.debug('Execute: Create payment command', this.execute.name);
    const { userId, createSubscriptionDto } = command;
    try {
      const user = await this.usersRepository.getUserById(userId);
      if (!user) return this.appNotification.internalServerError();

      const payload: CreatePaymentDto = {
        userInfo: this.generateUserInfoData(user),
        createSubscriptionDto: createSubscriptionDto,
      };
      const result: AppNotificationResultType<string> =
        await this.paymentsServiceAdapter.createSubscription(payload);

      if (result.appResult !== AppNotificationResultEnum.Success)
        return this.appNotification.internalServerError();

      return this.appNotification.success({ url: result.data });
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private generateUserInfoData(user: UserEntity): UserInfoModel {
    return {
      userId: user.id,
      email: user.email,
      userName: user.username,
    };
  }
}
