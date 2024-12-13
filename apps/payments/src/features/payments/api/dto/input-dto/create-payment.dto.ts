import {
  SubscriptionType,
  PaymentSystem,
} from '../../../../../../../../libs/common/enums/payments';

export class CreatePaymentDto {
  subscriptionType: SubscriptionType;
  paymentSystem: PaymentSystem;
  // paymentCount: number;
  // autoRenewal: boolean;
}
