import { PaymentTransaction, Subscription } from '@prisma/payments';
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
        dateOfPayment: payment.dateOfPayment
          ? payment.dateOfPayment.toISOString()
          : null,
        endDateOfSubscription: payment.endDateOfSubscription
          ? payment.endDateOfSubscription.toISOString()
          : null,
        subscriptionId: payment.subId,
      }),
  );
};

export class SubscriptionInfoOutputDto {
  userId: string;
  subscriptionId: string;
  status: string;
  dateOfPayment: string;
  endDateOfSubscription: string;
  autoRenewal: boolean;
  constructor(data?: Partial<SubscriptionInfoOutputDto>) {
    Object.assign(this, data);
  }
}

export const subscriptionInfoMapper = (
  subscription: Subscription,
): SubscriptionInfoOutputDto => {
  return new SubscriptionInfoOutputDto({
    userId: subscription.userId,
    subscriptionId: subscription.id,
    status: subscription.status,
    autoRenewal: subscription.autoRenewal,
    dateOfPayment: subscription.dateOfPayment
      ? subscription.dateOfPayment.toISOString()
      : null,
    endDateOfSubscription: subscription.endDateOfSubscription
      ? subscription.endDateOfSubscription.toISOString()
      : null,
  });
};
