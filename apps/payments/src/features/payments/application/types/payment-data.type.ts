import {
  PaymentSystem,
  SubscriptionType,
} from '../../../../../../../libs/common/enums/payments';

export type UserInfo = {
  userId: string;
  email: string;
  userName: string;
};

export type PaymentData = {
  successFrontendUrl: string;
  cancelFrontendUrl: string;
  productData: {
    name: string;
    description: string;
  };
  price: number;
  paymentCount: number;
  paymentSystem: PaymentSystem;
  subscriptionType: SubscriptionType;
  userInfo: UserInfo;
  customerId?: string;
  subId?: string;
  currentSubDateEnd?: Date;
};

export type PaymentTransactionWithSubUserInfo = {
  subscription: {
    userId: string;
    username: string;
  };
} & {
  id: string;
  dateOfPayment: Date;
  endDateOfSubscription: Date | null;
  paymentSystem: string;
  status: string;
  subscriptionType: string;
  price: number;
  subId: string;
};
