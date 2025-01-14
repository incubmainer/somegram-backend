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
  isActive: boolean;

  static create(inputDto: SubscriptionInputDto): SubscriptionEntity {
    const {
      userId,
      status,
      createdAt,
      autoRenewal,
      paymentSystem,
      isActive,
      paymentSystemSubId,
    } = inputDto;

    const subscription = new this();
    subscription.userId = userId;
    subscription.createdAt = createdAt;
    subscription.paymentSystem = paymentSystem;
    subscription.paymentSystemSubId = paymentSystemSubId;
    subscription.status = status;
    subscription.autoRenewal = autoRenewal;
    subscription.isActive = isActive;
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
      autoRenewal = true,
      isActive,
    } = updateDto;

    subscription.updatedAt = updatedAt;
    if (endDateOfSubscription)
      subscription.endDateOfSubscription = endDateOfSubscription;
    if (dateOfPayment) subscription.dateOfPayment = dateOfPayment;
    subscription.paymentSystemCustomerId = paymentSystemCustomerId;
    subscription.status = status;
    subscription.autoRenewal = autoRenewal;
    subscription.isActive = isActive;
  }

  static unActiveSubscription(subscription: Subscription): void {
    subscription.isActive = false;
    subscription.updatedAt = new Date();
  }

  static activateSubscription(subscription: Subscription): void {
    subscription.isActive = true;
    subscription.updatedAt = new Date();
  }

  static cancelSubscription(subscription: Subscription): void {
    subscription.isActive = false;
    if (
      subscription.endDateOfSubscription.toISOString() <=
      new Date().toISOString()
    ) {
      subscription.status = SubscriptionStatuses.Canceled;
    }
  }
}

export type SubscriptionInputDto = {
  userId: string;
  createdAt: Date;
  paymentSystem: string;
  status: string;
  autoRenewal: boolean;
  isActive: boolean;
  paymentSystemSubId?: string;
};

export type SubscriptionUpdateDto = {
  updatedAt: Date;
  paymentSystemCustomerId: string;
  status: SubscriptionStatuses;
  isActive: boolean;
  endDateOfSubscription?: Date;
  dateOfPayment?: Date;
  autoRenewal?: boolean;
};
