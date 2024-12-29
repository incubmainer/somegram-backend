import { Injectable } from '@nestjs/common';
import { Subscription } from '@prisma/payments';
import { SubscriptionStatuses } from '../../../common/enum/transaction-statuses.enum';

@Injectable()
export class SubscriptionEntity implements Subscription {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date | null;
  dateOfPayment: Date | null;
  endDateOfSubscription: Date | null;
  paymentSystemSubId: string | null;
  paymentSystemCustomerId: string | null;
  paymentSystem: string;
  status: string;
  autoRenewal: boolean;

  static create(inputDto: SubscriptionInputDto): SubscriptionEntity {
    const { userId, status, createdAt, autoRenewal, paymentSystem } = inputDto;
    const subscription = new this();
    subscription.userId = userId;
    subscription.createdAt = createdAt;
    subscription.paymentSystem = paymentSystem;
    subscription.status = status;
    subscription.autoRenewal = autoRenewal;
    return subscription;
  }

  static update(
    subscription: Subscription,
    updateDto: SubscriptionUpdateDto,
  ): void {
    const {
      updatedAt,
      endDateOfSubscription,
      dateOfPayment,
      paymentSystemCustomerId,
      status,
    } = updateDto;
    subscription.updatedAt = updatedAt;
    subscription.endDateOfSubscription = endDateOfSubscription;
    subscription.dateOfPayment = dateOfPayment;
    subscription.paymentSystemCustomerId = paymentSystemCustomerId;
    subscription.status = status;
  }
}

export type SubscriptionInputDto = {
  userId: string;
  createdAt: Date;
  paymentSystem: string;
  status: string;
  autoRenewal: boolean;
};

export type SubscriptionUpdateDto = {
  updatedAt: Date;
  dateOfPayment: Date;
  endDateOfSubscription: Date;
  paymentSystemCustomerId: string;
  status: SubscriptionStatuses;
};
