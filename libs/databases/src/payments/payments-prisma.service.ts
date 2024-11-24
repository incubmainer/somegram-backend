import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient as PaymentsPrismaClient } from '@prisma/payments';

export const PaymentsPrismaServiceToken = Symbol('PaymentsPrismaServiceToken');

@Injectable()
export class PaymentsPrismaService
  extends PaymentsPrismaClient
  implements OnModuleInit
{
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
