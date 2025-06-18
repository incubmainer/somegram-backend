import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient, Prisma } from '@prisma/gateway';
import { LoggerService } from '@app/logger';
import { validate as isValidUUID } from 'uuid';

import { UserEntity } from '../domain/user.entity';
import { SearchQueryParametersWithoutSorting } from '../../../common/domain/query.types';
import { UserAndUserBanInfoType, UserInfoAndUserIsBan } from '../domain/types';

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

    const where: Prisma.UserWhereInput = {
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

    if (cursorUserId && isValidUUID(cursorUserId)) {
      where.id = {
        gt: cursorUserId,
        not: userId,
      };
    }

    const users = await this.txHost.tx.user.findMany({
      where,
      take: queryString.pageSize,
      orderBy: { id: 'asc' },
    });

    const count = await this.txHost.tx.user.count({
      where,
    });

    return {
      users: users as UserEntity[],
      count,
    };
  }

  async findUserWithPostsCounts(userId: string): Promise<{
    user: UserEntity;
    publicationsCount: number;
    followersCount: number;
    followingCount: number;
  } | null> {
    this.logger.debug(
      `Execute: find user by id: ${userId}  with posts count and followee/wers counts query`,
      this.findUserWithPostsCounts.name,
    );

    const where: Prisma.UserWhereInput = {
      id: userId,
      isDeleted: false,
      isConfirmed: true,
      userBanInfo: {
        is: null,
      },
    };

    const user = await this.txHost.tx.user.findFirst({
      where,
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            UserPost: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      user: new UserEntity(user),
      publicationsCount: user._count.UserPost,
      followersCount: user._count.followers,
      followingCount: user._count.following,
    };
  }

  async getFollowingToInfo(userId: string): Promise<UserEntity[] | null> {
    this.logger.debug(
      `Execute: get following to: ${userId}`,
      this.getFollowingToInfo.name,
    );
    const user = await this.txHost.tx.user.findUnique({
      where: { id: userId },
      include: {
        following: {
          include: { followee: true },
        },
      },
    });
    return user.following.map((f) => new UserEntity(f.followee));
  }

  public async getFollowers(
    userId: string,
    queryString?: SearchQueryParametersWithoutSorting,
    cursorUserId?: string,
  ): Promise<{ users: UserEntity[]; count: number }> {
    this.logger.debug('Execute: get followers', this.getFollowers.name);

    const where: Prisma.UserWhereInput = {
      following: {
        some: {
          followeeId: userId,
        },
      },
      isDeleted: false,
      isConfirmed: true,
      userBanInfo: {
        is: null,
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

    const [users, count] = await Promise.all([
      this.txHost.tx.user.findMany({
        where,
        take: queryString.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.txHost.tx.user.count({ where }),
    ]);

    return {
      users: users as UserEntity[],
      count,
    };
  }
  public async getFollowing(
    userId: string,
    queryString?: SearchQueryParametersWithoutSorting,
    cursorUserId?: string,
  ): Promise<{ users: UserEntity[]; count: number }> {
    this.logger.debug('Execute: get following', this.getFollowing.name);

    const where: Prisma.UserWhereInput = {
      followers: {
        some: {
          followerId: userId,
        },
      },
      isDeleted: false,
      isConfirmed: true,
      userBanInfo: {
        is: null,
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

    const [users, count] = await Promise.all([
      this.txHost.tx.user.findMany({
        where,
        take: queryString.pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.txHost.tx.user.count({ where }),
    ]);

    return {
      users: users as UserEntity[],
      count,
    };
  }

  async getUserAndUserIsBan(
    userId: string,
  ): Promise<UserInfoAndUserIsBan | null> {
    this.logger.debug(
      'Execute: get user and user ban info',
      this.getUserAndUserIsBan.name,
    );
    const user = await this.txHost.tx.user.findUnique({
      where: { id: userId },
      include: { userBanInfo: true },
    });

    return user
      ? {
          user,
          isBan: !!user.userBanInfo,
        }
      : null;
  }

  async getUsersAndUsersIsBan(
    userIds: string[],
  ): Promise<UserAndUserBanInfoType[] | null> {
    this.logger.debug(
      'Execute: get users and users ban info',
      this.getUsersAndUsersIsBan.name,
    );
    const result = await this.txHost.tx.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      include: { userBanInfo: true },
    });

    return result && result.length > 0 ? result : null;
  }
}
