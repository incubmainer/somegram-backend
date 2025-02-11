import { PaymentTransaction } from '@prisma/payments';
import { Injectable } from '@nestjs/common';
import {
  PaymentSystem,
  SubscriptionType,
} from '../../../../../../libs/common/enums/payments';
import { TransactionStatuses } from '../../../common/enum/transaction-statuses.enum';

@Injectable()
export class TransactionEntity implements PaymentTransaction {
  id: string;
  subscriptionType: string;
  price: number;
  paymentSystem: string;
  status: string;
  dateOfPayment: Date;
  endDateOfSubscription: Date | null;
  subId: string;

  static create(inputDto: TransactionInputDto): TransactionEntity {
    const {
      system,
      status,
      price,
      subId,
      endDateOfSubscription,
      dateOfPayment,
      subscriptionType,
    } = inputDto;

    const transaction = new this();

    transaction.price = price;
    transaction.paymentSystem = system;
    transaction.subscriptionType = subscriptionType;
    transaction.status = status;
    transaction.subId = subId;
    transaction.dateOfPayment = dateOfPayment;
    transaction.endDateOfSubscription = endDateOfSubscription;

    return transaction;
  }
}

export type TransactionInputDto = {
  price: number;
  system: PaymentSystem;
  status: TransactionStatuses;
  subId: string;
  dateOfPayment: Date;
  endDateOfSubscription: Date;
  subscriptionType: SubscriptionType;
};
