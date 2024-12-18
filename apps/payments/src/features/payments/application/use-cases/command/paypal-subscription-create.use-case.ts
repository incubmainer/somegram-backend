import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { SubscriptionCreatedType } from '../../../../../common/adapters/types/paypal/types';
import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SubscriptionStatuses } from '../../../../../common/enum/transaction-statuses.enum';
import { PaymentSystem } from '../../../../../../../../libs/common/enums/payments';

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
  ) {}

  async execute(
    command: PayPalSubscriptionCreateUseCase,
  ): Promise<AppNotificationResultType<null>> {
    const { id, custom_id } = command.inputModel;

    try {
      const data = this.createData(custom_id, id);
      await this.paymentsRepository.createSubscription(data);
      return this.appNotification.success(null);
    } catch (e) {
      // TODO Logger
      return this.appNotification.internalServerError();
    }
  }

  private createData(userId: string, subId: string) {
    return {
      userId: userId,
      autoRenewal: true,
      status: SubscriptionStatuses.Canceled,
      paymentSystem: PaymentSystem.PAYPAL,
      paymentSystemSubId: subId,
    };
  }
}
