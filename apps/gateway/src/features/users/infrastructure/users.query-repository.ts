import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { LoggerService } from '@app/logger';
import { UserEntity } from '../domain/user.entity';
import { SearchQueryParametersWithoutSorting } from '../../../common/domain/query.types';

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
  public async searchUsers(
    userId: string,
    queryString?: SearchQueryParametersWithoutSorting,
    cursorUserId?: string,
  ): Promise<{ users: UserEntity[]; count: number }> {
    this.logger.debug('Get users profiles by search', this.searchUsers.name);

    const skip = queryString.pageSize * (queryString.pageNumber - 1);
    const where: any = {
      isDeleted: false,
      isConfirmed: true,
      userBanInfo: {
        is: null,
      },
      id: {
        not: userId,
      },
    };

    if (queryString.search && queryString.search.trim() !== '') {
      where.username = {
        contains: queryString.search,
        mode: 'insensitive',
      };
    }

    if (cursorUserId) {
      where.id = {
        gt: cursorUserId,
      };
    }

    const users = await this.txHost.tx.user.findMany({
      where,
      skip,
      take: queryString.pageSize,
    });

    const count = await this.txHost.tx.user.count({
      where: {
        ...where,
      },
    });

    return {
      users: users as UserEntity[],
      count,
    };
  }
}
