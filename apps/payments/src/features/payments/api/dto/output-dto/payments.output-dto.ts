import { Subscription, PaymentTransaction } from '@prisma/payments';
import {
  SubscriptionStatuses,
  SubscriptionType,
} from '../../../../../../../../libs/common/enums/payments';
import { PaymentTransactionWithSubUserInfo } from '../../../application/types/payment-data.type';

export class MyPaymentsOutputDto {
  subscriptionType: SubscriptionType;
  price: number;
  paymentSystem: string;
  status: string;
  dateOfPayment: string;
  endDateOfSubscription: string;
  subscriptionId: string;
  userId?: string;

  constructor(data?: Partial<MyPaymentsOutputDto>) {
    Object.assign(this, data);
  }
}

export const myPaymentsMapper = (
  payments: PaymentTransaction[],
  userId?: string,
): MyPaymentsOutputDto[] => {
  return payments.map((payment) => {
    const dtoData: any = {
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
    };

    if (userId) {
      dtoData.userId = userId;
    }
    return new MyPaymentsOutputDto(dtoData);
  });
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
  subscription: Subscription,
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
    subscriptionType: subscription.subscriptionType,
  });
};

export class PaymentsWithUserInfoOutputDto {
  subscriptionId: string;
  subscriptionType: string;
  price: number;
  paymentSystem: string;
  status: string;
  dateOfPayment: string;
  endDateOfSubscription: string;
  userId: string;
  username: string;

  constructor(data?: Partial<PaymentsWithUserInfoOutputDto>) {
    Object.assign(this, data);
  }
}

export const paymentsWithUserInfoMapper = (
  payments: PaymentTransactionWithSubUserInfo[],
): PaymentsWithUserInfoOutputDto[] => {
  return payments.map((payment) => {
    return {
      subscriptionId: payment.subId,
      subscriptionType: payment.subscriptionType,
      price: payment.price,
      paymentSystem: payment.paymentSystem,
      status: payment.status,
      dateOfPayment: payment.dateOfPayment.toISOString(),
      endDateOfSubscription: payment.endDateOfSubscription
        ? payment.endDateOfSubscription.toISOString()
        : null,
      userId: payment.subscription?.userId,
      username: payment.subscription?.username,
    };
  });
};
