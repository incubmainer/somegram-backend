import { PaymentTime } from '../../../../../libs/common/enums/payments';

export interface IPaymentServiceAdapter {
  createAutoPayment<T>(payload: T): Promise<string>;

  disableAutoRenewal(paymentSystemSubId: string): Promise<any>; // TODO Type for return

  enableAutoRenewal(paymentSystemSubId: string): Promise<any>; // TODO Type for return

  createPricePlan<T>(payload: T): Promise<string>;

  updateAutoPayment<T>(payload: T): Promise<any>; // TODO Type for return

  getIntervalBySubType(typeSubscription: PaymentTime): Promise<any>; // TODO Type for return
}
