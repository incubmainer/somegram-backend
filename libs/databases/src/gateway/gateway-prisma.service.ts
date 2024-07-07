import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';

@Injectable()
export class GatewayPrismaService
  extends GatewayPrismaClient
  implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
