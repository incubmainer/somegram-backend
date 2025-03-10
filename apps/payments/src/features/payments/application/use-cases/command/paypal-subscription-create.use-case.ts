import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentSystem } from '../../../../../../../../libs/common/enums/payments';
import {
  SubscriptionEntity,
  SubscriptionInputDto,
} from '../../../domain/subscription.entity';
import { Subscription } from '@prisma/payments';
import { Inject } from '@nestjs/common';
import { LoggerService } from '@app/logger';
import { SubscriptionStatuses } from '../../../../../common/enum/subscription-types.enum';
import { UserInfo } from '../../types/payment-data.type';

export class PayPalSubscriptionCreateUseCase {
  constructor(
    public inputModel: { userInfo: UserInfo; subId: string },
    public subscriptionType: string,
  ) {}
}

@CommandHandler(PayPalSubscriptionCreateUseCase)
export class PayPalSubscriptionCreateUseCaseHandler
  implements
    ICommandHandler<
      PayPalSubscriptionCreateUseCase,
      AppNotificationResultType<boolean>
    >
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly appNotification: ApplicationNotification,
    @Inject(SubscriptionEntity.name)
    private readonly subscriptionEntity: typeof SubscriptionEntity,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PayPalSubscriptionCreateUseCaseHandler.name);
  }

  async execute(
    command: PayPalSubscriptionCreateUseCase,
  ): Promise<AppNotificationResultType<null>> {
    this.logger.debug('Execute: create subscription', this.execute.name);
    const { subId, userInfo } = command.inputModel;
    try {
      const data = this.generateCreateData(
        userInfo,
        subId,
        command.subscriptionType,
      );
      const subscription: Subscription = this.subscriptionEntity.create(data);
      await this.paymentsRepository.createSub(subscription);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private generateCreateData(
    userInfo: UserInfo,
    subId: string,
    subscriptionType: string,
  ): SubscriptionInputDto {
    return {
      userId: userInfo.userId,
      username: userInfo.userName,
      autoRenewal: true,
      status: SubscriptionStatuses.Pending,
      paymentSystem: PaymentSystem.PAYPAL,
      paymentSystemSubId: subId,
      createdAt: new Date(),
      subscriptionType,
    };
  }
}
