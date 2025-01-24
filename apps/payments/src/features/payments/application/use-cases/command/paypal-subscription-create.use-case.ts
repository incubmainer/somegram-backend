import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { SubscriptionCreatedType } from '../../../../../common/adapters/types/paypal/types';
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

export class PayPalSubscriptionCreateUseCase {
  constructor(public inputModel: SubscriptionCreatedType) {}
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
    const { id, custom_id } = command.inputModel;
    try {
      const data = this.generateCreateData(custom_id, id);
      const subscription: Subscription = this.subscriptionEntity.create(data);
      await this.paymentsRepository.createSub(subscription);
      return this.appNotification.success(null);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private generateCreateData(
    userId: string,
    subId: string,
  ): SubscriptionInputDto {
    return {
      userId: userId,
      autoRenewal: true,
      status: SubscriptionStatuses.Pending,
      paymentSystem: PaymentSystem.PAYPAL,
      paymentSystemSubId: subId,
      createdAt: new Date(),
    };
  }
}
