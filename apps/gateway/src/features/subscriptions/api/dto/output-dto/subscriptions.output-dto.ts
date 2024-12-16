import { ApiProperty } from '@nestjs/swagger';
import {
  PaymentSystem,
  SubscriptionType,
} from '../../../../../../../../libs/common/enums/payments';
import {
  SubscriptionStatuses,
  TransactionStatuses,
} from '../../../../../../../payments/src/common/enum/transaction-statuses.enum';

export class MyPaymentsOutputDto {
  @ApiProperty({
    enum: SubscriptionType,
  })
  subscriptionType: SubscriptionType;
  @ApiProperty({
    description: 'price in USD',
    example: 22.5,
    type: Number,
  })
  price: number;
  @ApiProperty({
    description: 'pyment system',
    enum: PaymentSystem,
  })
  paymentSystem: string;
  @ApiProperty({
    description: 'Payment status',
    enum: TransactionStatuses,
  })
  status: string;
  @ApiProperty({
    description: 'date of payment',
    example: '2024-12-13T11:58:54.000Z',
  })
  dateOfPayment: string;
  @ApiProperty({
    description: 'end date of subscription',
    example: '2025-01-13T11:58:54.000Z',
  })
  endDateOfSubscription: string;
  @ApiProperty({
    description: 'subscription id',
    example: '2f4a4a9c-3503-47fe-8d55-1310bb2e4403',
  })
  subscriptionId: string;
}

export class SubscriptionInfoOutputDto {
  @ApiProperty({
    description: 'subscription status',
    enum: SubscriptionStatuses,
  })
  status: string;
  @ApiProperty({
    description: 'date of payment',
    example: '2024-12-13T11:58:54.000Z',
  })
  dateOfPayment: string;
  @ApiProperty({
    description: 'end date of subscription',
    example: '2025-01-13T11:58:54.000Z',
  })
  endDateOfSubscription: string;
  @ApiProperty({
    description: 'subscription id',
    example: '2f4a4a9c-3503-47fe-8d55-1310bb2e4403',
  })
  subscriptionId: string;
}
