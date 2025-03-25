import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { LoggerService } from '@app/logger';

import { UserWithBanInfo } from '../domain/user.interfaces';
import { UsersQueryStringInput } from '../../resolvers/users/models/users-query-string-input';
import { UserBlockStatus } from '../../../../../../libs/common/enums/user-block-status.enum';

@Injectable()
export class UsersGraphqlRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UsersGraphqlRepository.name);
  }
  async findUserById(id?: string): Promise<UserWithBanInfo | null> {
    this.logger.debug(`Find user by id: ${id}`, this.findUserById.name);

    const user = await this.txHost.tx.user.findFirst({
      where: { id, isDeleted: false },
      include: { userBanInfo: true },
    });
    return user ? user : null;
  }

  public async getUsers(
    queryString: UsersQueryStringInput,
  ): Promise<{ users: UserWithBanInfo[]; count: number }> {
    this.logger.debug(`Get all users`, this.getUsers.name);

    const skip = queryString.pageSize * (queryString.pageNumber - 1);
    const where: any = {};
    if (queryString.search && queryString.search.trim() !== '') {
      where.username = {
        contains: queryString.search,
        mode: 'insensitive',
      };
    }

    where.isDeleted = false;

    if (queryString.statusFilter === UserBlockStatus.BLOCKED) {
      where.UserBanInfo = { isNot: null };
    } else if (queryString.statusFilter === UserBlockStatus.UNBLOCKED) {
      where.UserBanInfo = { is: null };
    }

    const users = await this.txHost.tx.user.findMany({
      where,
      include: { userBanInfo: true },
      orderBy: { [queryString.sortBy]: queryString.sortDirection },
      skip,
      take: queryString.pageSize,
    });

    const count = await this.txHost.tx.user.count({
      where,
    });

    return {
      users,
      count,
    };
  }

  async findUsersByIds(ids: string[]) {
    this.logger.debug(`Get users by ids `, this.findUsersByIds.name);
    return this.txHost.tx.user.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: { userBanInfo: true },
    });
  }

  async removeUser(userId: string): Promise<boolean> {
    const res = await this.txHost.tx.user.update({
      where: { id: userId },
      data: { isDeleted: true },
    });

    return !!res;
  }

  async banUser(userId: string, reason: string): Promise<boolean> {
    await this.txHost.tx.userBanInfo.create({
      data: {
        userId: userId,
        banReason: reason,
        banDate: new Date(),
      },
    });

    return true;
  }

  async unbanUser(userId: string): Promise<boolean> {
    await this.txHost.tx.userBanInfo.delete({
      where: { userId: userId },
    });
    return true;
  }
}
