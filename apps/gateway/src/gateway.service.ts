import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/gateway';

@Injectable()
export class GatewayService {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterPrisma>,
  ) { }
  async getUsers(): Promise<User[]> {
    const user = await this.txHost.tx.user.findMany();
    return user;
  }
}
