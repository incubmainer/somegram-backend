import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';

import { PaymentsRepository } from '../../../infrastructure/payments.repository';
import { CreatePaymentDto } from '../../../api/dto/input-dto/create-payment.dto';
import {
  PaymentSystem,
  SubscriptionType,
} from '../../../../../../../../libs/common/enums/payments';
import { PaymentData, UserInfo } from '../../types/payment-data.type';
import { PaymentsService } from '../../../api/payments.service';
import {
  ApplicationNotification,
  AppNotificationResultType,
} from '@app/application-notification';
import { Subscription } from '@prisma/payments';
import { LoggerService } from '@app/logger';
import { EnvSettings } from '../../../../../settings/env/env.settings';
import { ConfigurationType } from '../../../../../settings/configuration/configuration';

export class CreatePaymentCommand {
  constructor(
    public userInfo: UserInfo,
    public createSubscriptionDto: CreatePaymentDto,
  ) {}
}

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentUseCase
  implements ICommandHandler<CreatePaymentCommand>
{
  private readonly SUBSCRIPTION_PRICE = {
    day: 10,
    weekly: 50,
    monthly: 100,
  }; // USD per day
  private readonly successFrontendUrl: string;
  private readonly cancelFrontendUrl: string;
  private readonly envSettings: EnvSettings;
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly paymentsService: PaymentsService,
    private readonly appNotification: ApplicationNotification,
    private readonly logger: LoggerService,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    this.logger.setContext(CreatePaymentUseCase.name);
    this.envSettings = this.configService.get('envSettings', { infer: true });
    this.successFrontendUrl = this.envSettings.FRONTEND_SUCCESS_PAYMENT_URL;
    this.cancelFrontendUrl = this.envSettings.FRONTEND_CANCEL_PAYMENT_URL;
  }

  async execute(
    command: CreatePaymentCommand,
  ): Promise<AppNotificationResultType<string>> {
    this.logger.debug('Execute: create payment', this.execute.name);
    const { subscriptionType, paymentSystem } = command.createSubscriptionDto;

    try {
      const price = this.handlePrice(subscriptionType);
      const paymentData = this.generatePaymentData(
        price,
        command.userInfo,
        paymentSystem,
        subscriptionType,
      );

      const subscriptionInfo =
        await this.paymentsRepository.getActiveSubscriptionByUserId(
          command.userInfo.userId,
        );

      if (this.isValidActiveSubscription(subscriptionInfo)) {
        return await this.handleSubscriptionUpdate(
          paymentData,
          subscriptionInfo,
        );
      }

      return await this.handleNewSubscription(paymentData);
    } catch (e) {
      this.logger.error(e, this.execute.name);
      return this.appNotification.internalServerError();
    }
  }

  private generatePaymentData(
    price: number,
    userInfo: UserInfo,
    system: PaymentSystem,
    subType: SubscriptionType,
  ): PaymentData {
    return {
      successFrontendUrl: this.successFrontendUrl,
      cancelFrontendUrl: this.cancelFrontendUrl,
      productData: {
        name: 'Бизнесс аккаунт',
        description: 'c автопродлением',
      },
      price,
      paymentCount: 1,
      paymentSystem: system,
      subscriptionType: subType,
      userInfo: userInfo,
    };
  }

  private handlePrice(subscriptionType: SubscriptionType): number {
    let price: number;
    switch (subscriptionType) {
      case SubscriptionType.DAY:
        price = this.SUBSCRIPTION_PRICE.day * 100;
        break;
      case SubscriptionType.WEEKLY:
        price = this.SUBSCRIPTION_PRICE.weekly * 100;
        break;
      case SubscriptionType.MONTHLY:
        price = this.SUBSCRIPTION_PRICE.monthly * 100;
        break;
    }
    return price;
  }

  private isValidActiveSubscription(
    subscriptionInfo: Subscription | null,
  ): boolean {
    return (
      !!subscriptionInfo &&
      (subscriptionInfo.autoRenewal === true ||
        subscriptionInfo.endDateOfSubscription > new Date())
    );
  }

  private async handleSubscriptionUpdate(
    paymentData: PaymentData,
    subscriptionInfo: Subscription,
  ): Promise<AppNotificationResultType<string>> {
    paymentData.customerId = subscriptionInfo.paymentSystemCustomerId;
    paymentData.subId = subscriptionInfo.paymentSystemSubId;
    paymentData.currentSubDateEnd = subscriptionInfo.endDateOfSubscription;

    const url: string =
      await this.paymentsService.updateCurrentSub(paymentData);

    if (url) return this.appNotification.success(url);

    return this.appNotification.internalServerError();
  }

  private async handleNewSubscription(
    paymentData: PaymentData,
  ): Promise<AppNotificationResultType<string>> {
    const url: string | null =
      await this.paymentsService.createAutoPayment(paymentData);

    if (url) return this.appNotification.success(url);

    return this.appNotification.internalServerError();
  }
}
