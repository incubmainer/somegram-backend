import { Injectable } from '@nestjs/common';
import { PaymentManager } from '../../../common/managers/payment.manager';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentManager: PaymentManager) {}

  async makePayment(payload: any) {
    return await this.paymentManager.makePayment(payload);
  }

  // async createAutoPayment(payload: MakePaymentRequest) {
  //   return await this.paymentManager.createAutoSubscription(payload);
  // }
}
