import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient as GatewayPrismaClient, Prisma } from '@prisma/gateway';
import { LoggerService } from '@app/logger';

import { SearchQueryParameters } from '../../../common/domain/query.types';
import { UserFollowInfo } from '../domain/user.interfaces';
import { FollowSortValues } from '../../resolvers/users/models/follow-query-string-input';

@Injectable()
export class UsersFollowGraphqlRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(UsersFollowGraphqlRepository.name);
  }

  public async getFollowers(
    userId: string,
    queryString?: SearchQueryParameters,
  ): Promise<{
    followersInfo: UserFollowInfo[];
    count: number;
  }> {
    const skip = queryString.pageSize * (queryString.pageNumber - 1);

    const where: Prisma.UserFollowWhereInput = {
      followeeId: userId,
    };

    const orderBy = this.getFollowOrderBy(queryString, 'follower');

    const [followersInfo, count] = await Promise.all([
      this.txHost.tx.userFollow.findMany({
        where,
        include: {
          follower: {
            include: {
              userBanInfo: true,
            },
          },
        },
        orderBy,
        skip,
        take: queryString.pageSize,
      }),
      this.txHost.tx.userFollow.count({ where }),
    ]);

    return {
      followersInfo,
      count,
    };
  }

  public async getFollowing(
    userId: string,
    queryString?: SearchQueryParameters,
  ): Promise<{
    followingInfo: UserFollowInfo[];
    count: number;
  }> {
    const skip = queryString.pageSize * (queryString.pageNumber - 1);

    const where: Prisma.UserFollowWhereInput = {
      followerId: userId,
    };

    const orderBy = this.getFollowOrderBy(queryString, 'followee');

    const [followingInfo, count] = await Promise.all([
      this.txHost.tx.userFollow.findMany({
        where,
        include: {
          followee: {
            include: {
              userBanInfo: true,
            },
          },
        },
        orderBy,
        skip,
        take: queryString.pageSize,
      }),
      this.txHost.tx.userFollow.count({ where }),
    ]);

    return {
      followingInfo,
      count,
    };
  }

  private getFollowOrderBy(
    queryString: SearchQueryParameters,
    relationType: 'follower' | 'followee',
  ) {
    if (queryString.sortBy === FollowSortValues.Username) {
      return {
        [relationType]: {
          username: queryString.sortDirection,
        },
      };
    }

    if (queryString.sortBy === FollowSortValues.CreatedAt) {
      return {
        createdAt: queryString.sortDirection,
      };
    }

    return { [queryString.sortBy]: queryString.sortDirection };
  }
}
