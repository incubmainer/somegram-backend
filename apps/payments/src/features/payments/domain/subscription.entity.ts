import { Injectable } from '@nestjs/common';
import { Subscription } from '@prisma/payments';
import { SubscriptionStatuses } from '../../../common/enum/subscription-types.enum';

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
    const {
      userId,
      status,
      createdAt,
      autoRenewal,
      paymentSystem,
      paymentSystemSubId,
    } = inputDto;

    const subscription = new this();
    subscription.userId = userId;
    subscription.createdAt = createdAt;
    subscription.paymentSystem = paymentSystem;
    subscription.paymentSystemSubId = paymentSystemSubId;
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
      autoRenewal = true,
    } = updateDto;

    subscription.updatedAt = updatedAt;
    if (endDateOfSubscription)
      subscription.endDateOfSubscription = endDateOfSubscription;
    if (dateOfPayment) subscription.dateOfPayment = dateOfPayment;
    subscription.paymentSystemCustomerId = paymentSystemCustomerId;
    subscription.status = status;
    subscription.autoRenewal = autoRenewal;
  }

  static activateSubscription(
    subscription: Subscription,
    paymentDate?: Date,
    endSubscriptionDate?: Date,
  ): void {
    subscription.updatedAt = new Date();
    subscription.status = SubscriptionStatuses.Active;
    subscription.autoRenewal = true;

    if (paymentDate) subscription.dateOfPayment = paymentDate;
    if (endSubscriptionDate)
      subscription.endDateOfSubscription = endSubscriptionDate;
  }

  static suspendSubscription(subscription: Subscription): void {
    subscription.updatedAt = new Date();
    subscription.status = SubscriptionStatuses.Suspended;
    subscription.autoRenewal = false;
  }

  static disableAutoRenewal(subscription: Subscription): void {
    subscription.updatedAt = new Date();
    subscription.autoRenewal = false;
  }

  static enableAutoRenewal(subscription: Subscription): void {
    subscription.updatedAt = new Date();
    subscription.autoRenewal = true;
  }

  static cancelSubscription(subscription: Subscription): void {
    subscription.updatedAt = new Date();
    subscription.status = SubscriptionStatuses.Canceled;
    subscription.autoRenewal = false;
  }
}

export type SubscriptionInputDto = {
  userId: string;
  createdAt: Date;
  paymentSystem: string;
  status: string;
  autoRenewal: boolean;
  paymentSystemSubId?: string;
};

export type SubscriptionUpdateDto = {
  updatedAt: Date;
  paymentSystemCustomerId: string;
  status: SubscriptionStatuses;
  endDateOfSubscription?: Date;
  dateOfPayment?: Date;
  autoRenewal?: boolean;
};

export type ActiveSubscriptionDateType = {
  dateOfPayment: Date;
  dateEndSubscription: Date;
};
