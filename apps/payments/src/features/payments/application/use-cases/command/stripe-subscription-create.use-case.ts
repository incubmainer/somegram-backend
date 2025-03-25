import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { Subscription } from '@prisma/payments';
import { Inject } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { PaymentSystem } from '../../../../../../../../libs/common/enums/payments';
import {
  SubscriptionEntity,
  SubscriptionInputDto,
} from '../../../domain/subscription.entity';
import { SubscriptionStatuses } from '../../../../../common/enum/subscription-types.enum';
import { UserInfo } from '../../types/payment-data.type';

export class StripeSubscriptionCreateCommand {
  constructor(
    public inputModel: { userInfo: UserInfo; subscriptionType: string },
  ) {}
}

@CommandHandler(StripeSubscriptionCreateCommand)
export class StripeSubscriptionCreateUseCase
  implements
    ICommandHandler<
      StripeSubscriptionCreateCommand,
      AppNotificationResultType<string>
    >
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appNotification: ApplicationNotification,
    @Inject(SubscriptionEntity.name)
    private readonly subscriptionEntity: typeof SubscriptionEntity,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(StripeSubscriptionCreateUseCase.name);
  }

  async execute(
    command: StripeSubscriptionCreateCommand,
  ): Promise<AppNotificationResultType<string>> {
    this.logger.debug('Execute: create subscription', this.execute.name);
    const { userInfo, subscriptionType } = command.inputModel;
    try {
      const data = this.generateCreateData(userInfo, subscriptionType);
      const subscription: Subscription = this.subscriptionEntity.create(data);
      const newSubId = await this.paymentsRepository.createSub(subscription);
      return this.appNotification.success(newSubId);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private generateCreateData(
    userInfo: UserInfo,
    subscriptionType: string,
  ): SubscriptionInputDto {
    return {
      userId: userInfo.userId,
      username: userInfo.userName,
      autoRenewal: true,
      status: SubscriptionStatuses.Pending,
      paymentSystem: PaymentSystem.STRIPE,
      createdAt: new Date(),
      subscriptionType,
    };
  }
}
