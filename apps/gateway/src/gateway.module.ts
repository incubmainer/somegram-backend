import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { PrismaClient } from '@prisma/gateway';

@Module({
  imports: [],
  controllers: [GatewayController],
  providers: [GatewayService, PrismaClient],
})
export class GatewayModule { }
