import { Injectable } from '@nestjs/common';
import { User } from '../domain/user';
import { UserId } from '../domain/value-objects/user-id';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Email } from '../domain/value-objects/email';
import { Username } from '../domain/value-objects/username';
import { v4 as uuidv4 } from 'uuid';
import { userFromDomainToDbCreate } from './mapping/user-from-domain-to-db-create';
import { UserRepository } from '../domain/user.repository';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
  ) { }

  public async isUniqueEmail(email: Email): Promise<boolean> {
    const count = await this.txHost.tx.user.count({
      where: {
        email: email.value,
      },
    });
    return count === 0;
  }

  public async isUniqueUsername(username: Username): Promise<boolean> {
    const count = await this.txHost.tx.user.count({
      where: {
        username: username.value,
      },
    });
    return count === 0;
  }

  public generateId(): UserId {
    const userId = uuidv4();
    return new UserId(userId);
  }

  public async save(user: User): Promise<void> {
    await this.txHost.tx.user.create({ data: userFromDomainToDbCreate(user) });
  }
}
