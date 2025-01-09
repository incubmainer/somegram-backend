import {
  SubscriptionType,
  PaymentSystem,
} from '../../../../../../../../libs/common/enums/payments';
import { UserInfo } from '../../../application/types/payment-data.type';

export class CreatePaymentDto {
  subscriptionType: SubscriptionType;
  paymentSystem: PaymentSystem;
  // paymentCount: number;
  // autoRenewal: boolean;
}

export class CreatePaymentInputDto {
  userInfo: UserInfo;
  createSubscriptionDto: CreatePaymentDto;
}

export type PayPalRawBodyPayloadType = {
  rawBody: Buffer;
  headers: Headers;
};
