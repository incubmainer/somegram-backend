import { Module } from '@nestjs/common';
import { GatewayPrismaService } from './gateway-prisma.service';

@Module({
  providers: [GatewayPrismaService],
  exports: [GatewayPrismaService],
})
export class GatewayPrismaModule { }
