import {
  PaymentTime,
  PaymentSystem,
} from '../../../../../../../../libs/common/enums/payments';

export class CreatePaymentDto {
  typeSubscription: PaymentTime;
  paymentSystem: PaymentSystem;
  // paymentCount: number;
  // autoRenewal: boolean;
}
