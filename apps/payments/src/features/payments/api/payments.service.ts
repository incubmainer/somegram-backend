import { Injectable } from '@nestjs/common';

import { PaymentManager } from '../../../common/managers/payment.manager';
import { PaymentData } from '../application/types/payment-data.type';
import { PaymentSystem } from '../../../../../../libs/common/enums/payments';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentManager: PaymentManager) {}
  async createAutoPayment(payload: PaymentData) {
    return await this.paymentManager.createAutoPayment(payload);
  }

  async updateCurrentSub(payload: PaymentData) {
    return await this.paymentManager.updateCurrentSub(payload);
  }

  async disableAutoRenewal(
    paymentSystem: PaymentSystem,
    paymentSubscriptionSubId: string,
  ) {
    return await this.paymentManager.disableAutoRenewal(
      paymentSystem,
      paymentSubscriptionSubId,
    );
  }

  async enableAutoRenewal(
    paymentSystem: PaymentSystem,
    paymentSubscriptionSubId: string,
  ) {
    return await this.paymentManager.enableAutoRenewal(
      paymentSystem,
      paymentSubscriptionSubId,
    );
  }
}
