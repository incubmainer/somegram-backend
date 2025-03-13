import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { LoggerService } from '@app/logger';
import { UserEntity } from '../domain/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UsersQueryRepository.name);
  }
  async findUserById(id?: string): Promise<UserEntity | null> {
    this.logger.debug(`Execute: get user by id: ${id}`, this.findUserById.name);

    const user = await this.txHost.tx.user.findFirst({
      where: { id },
    });
    return user ? new UserEntity(user) : null;
  }

  async getProfileInfo(userId: string): Promise<UserEntity | null> {
    this.logger.debug(
      `Execute: get profile info by user id: ${userId}`,
      this.getProfileInfo.name,
    );

    const user = await this.txHost.tx.user.findFirst({
      where: { id: userId },
    });
    return user ? new UserEntity(user) : null;
  }

  public async getTotalCountUsers(): Promise<number> {
    this.logger.debug(`Get total users count`, this.getTotalCountUsers.name);

    return this.txHost.tx.user.count();
  }
}
