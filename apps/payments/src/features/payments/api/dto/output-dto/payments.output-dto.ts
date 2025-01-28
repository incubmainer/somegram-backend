import { Subscription, PaymentTransaction } from '@prisma/payments';
import { SubscriptionType } from '../../../../../../../../libs/common/enums/payments';
import { SubscriptionStatuses } from '../../../../../common/enum/subscription-types.enum';

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
        subscriptionType: payment.subscriptionType as SubscriptionType,
        price: payment.price,
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
  subscriptionType: string;
  constructor(data?: Partial<SubscriptionInfoOutputDto>) {
    Object.assign(this, data);
  }
}

export const subscriptionInfoMapper = (
  subscription: {
    payments: PaymentTransaction[];
  } & Subscription,
): SubscriptionInfoOutputDto => {
  return new SubscriptionInfoOutputDto({
    userId: subscription.userId,
    subscriptionId: subscription.id,
    status:
      subscription.status === SubscriptionStatuses.Suspended
        ? SubscriptionStatuses.Active
        : subscription.status,
    autoRenewal: subscription.autoRenewal,
    dateOfPayment: subscription.dateOfPayment
      ? subscription.dateOfPayment.toISOString()
      : null,
    endDateOfSubscription: subscription.endDateOfSubscription
      ? subscription.endDateOfSubscription.toISOString()
      : null,
    subscriptionType: subscription.payments[0].subscriptionType,
  });
};
