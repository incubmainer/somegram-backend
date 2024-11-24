// cls-transactional.module.ts
import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { PaymentsPrismaModule } from '../../../../../libs/databases/src/Payments/Payments-prisma.module';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma/dist/src/lib/transactional-adapter-prisma';
import { PaymentsPrismaServiceToken } from '../../../../../libs/databases/src/Payments/payments-prisma.service';

@Module({
  imports: [
    ClsModule.forRoot({
      plugins: [
        new ClsPluginTransactional({
          imports: [PaymentsPrismaModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PaymentsPrismaServiceToken,
          }),
        }),
      ],
    }),
  ],
  exports: [ClsModule],
})
export class ClsTransactionalModule {}
