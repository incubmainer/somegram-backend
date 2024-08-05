import { Module } from '@nestjs/common';
import {
  GatewayPrismaService,
  GatewayPrismaServiceToken,
} from './gateway-prisma.service';

@Module({
  providers: [
    {
      provide: GatewayPrismaServiceToken,
      useClass: GatewayPrismaService,
    },
  ],
  exports: [GatewayPrismaServiceToken],
})
export class GatewayPrismaModule {}
