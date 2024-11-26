import { Injectable } from '@nestjs/common';
import { PaymentManager } from '../../../common/managers/payment.manager';
import { PaymentData } from '../application/types/payment-data.type';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentManager: PaymentManager) {}
  async createAutoPayment(payload: PaymentData) {
    return await this.paymentManager.createAutoPayment(payload);
  }
}
