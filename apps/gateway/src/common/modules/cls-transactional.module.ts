// cls-transactional.module.ts
import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { GatewayPrismaModule } from '@app/databases/gateway/gateway-prisma.module';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { GatewayPrismaServiceToken } from '@app/databases/gateway/gateway-prisma.service';

@Module({
  imports: [
    ClsModule.forRoot({
      plugins: [
        new ClsPluginTransactional({
          imports: [GatewayPrismaModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: GatewayPrismaServiceToken,
          }),
        }),
      ],
    }),
  ],
  exports: [ClsModule],
})
export class ClsTransactionalModule { }
