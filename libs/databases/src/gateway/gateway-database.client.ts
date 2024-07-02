import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/gateway';

@Injectable()
export class GatewayDatabaseClient
  extends PrismaClient
  implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
