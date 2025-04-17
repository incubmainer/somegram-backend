import { Controller } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as MessengerPrismaClient } from '@prisma/messenger';
import { MessagePattern } from '@nestjs/microservices';
import { HELLO_MESSENGER } from '../../../../gateway/src/common/constants/service.constants';

@Controller()
export class TestController {
  private key: number = 0;
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<MessengerPrismaClient>
    >,
  ) {}

  @MessagePattern({ cmd: HELLO_MESSENGER })
  async hello() {
    ++this.key;
    await this.txHost.tx.test.create({
      data: { test: `test ${this.key}` },
    });

    return this.txHost.tx.test.findMany();
  }
}
