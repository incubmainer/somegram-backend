import { CreateSubscriptionDto } from '../api/dto/input-dto/subscriptions.dto';

export type UserInfoModel = {
  userId: string;
  email: string;
  userName: string;
};

export type CreatePaymentDto = {
  userInfo: UserInfoModel;
  createSubscriptionDto: CreateSubscriptionDto;
};

export type PayPalRawBodyPayloadType = {
  rawBody: Buffer;
  headers: Headers;
};

export type StripeRawBodyPayloadType = {
  rawBody: Buffer;
  signatureHeader: string;
};
