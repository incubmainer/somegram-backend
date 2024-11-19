import { Module } from '@nestjs/common';
import {
  PaymentsPrismaService,
  PaymentsPrismaServiceToken,
} from './payments-prisma.service';

@Module({
  providers: [
    {
      provide: PaymentsPrismaServiceToken,
      useClass: PaymentsPrismaService,
    },
  ],
  exports: [PaymentsPrismaServiceToken],
})
export class PaymentsPrismaModule {}
