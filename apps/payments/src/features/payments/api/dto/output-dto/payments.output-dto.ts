import { PaymentTransaction } from '@prisma/payments';
import { SubscriptionType } from '../../../../../../../../libs/common/enums/payments';

const SUBSCRIPTION_TYPE = {
  day: SubscriptionType.DAY,
  week: SubscriptionType.WEEKLY,
  month: SubscriptionType.MONTHLY,
};

export class MyPaymentsOutputDto {
  subscriptionType: SubscriptionType;
  price: number;
  paymentSystem: string;
  status: string;
  dateOfPayment: string;
  endDateOfSubscription: string;
  subscriptionId: string;

  constructor(data?: Partial<MyPaymentsOutputDto>) {
    Object.assign(this, data);
  }
}

export const myPaymentsMapper = (
  payments: PaymentTransaction[],
): MyPaymentsOutputDto[] => {
  return payments.map(
    (payment) =>
      new MyPaymentsOutputDto({
        subscriptionType: SUBSCRIPTION_TYPE[payment.subscriptionType],
        price: payment.price / 100,
        paymentSystem: payment.paymentSystem,
        status: payment.status,
        dateOfPayment: payment.dateOfPayment.toISOString(),
        endDateOfSubscription: payment.endDateOfSubscription.toISOString(),
        subscriptionId: payment.subId,
      }),
  );
};
