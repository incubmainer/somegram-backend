// cls-transactional.module.ts
import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PaymentsPrismaModule } from '../../../../../libs/databases/src/payments/payments-prisma.module';
import { PaymentsPrismaServiceToken } from '../../../../../libs/databases/src/payments/payments-prisma.service';

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
