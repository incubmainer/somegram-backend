import {
  PaymentSystem,
  PaymentTime,
} from '../../../../../../../libs/common/enums/payments';

export type PaymentData = {
  successFrontendUrl: string;
  cancelFrontendUrl: string;
  productData: {
    name: string;
    description: string;
  };
  totalPrice: number;
  paymentCount: number;
  paymentSystem: PaymentSystem;
  typeSubscription: PaymentTime;
  autoRenewal: boolean;
  userId: string;
  paymentId: string | null;
};
