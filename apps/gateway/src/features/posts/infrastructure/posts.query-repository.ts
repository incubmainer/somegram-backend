import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { PrismaClient as GatewayPrismaClient, Prisma } from '@prisma/gateway';
import { SearchQueryParametersType } from '../../../common/domain/query.types';
import { getSanitizationQuery } from '../../../common/utils/query-params.sanitizator';
import { PostEntity } from '../domain/post.entity';
import { LoggerService } from '@app/logger';
import {
  LikeStatusEnum,
  PostWithLikeInfoModel,
  PostWithLikeInfoRawModel,
} from '../domain/types';

@Injectable()
export class PostsQueryRepository {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<GatewayPrismaClient>
    >,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(PostsQueryRepository.name);
  }

  public async getPostById(
    postId: string,
    userId: string | null,
  ): Promise<PostWithLikeInfoModel | null> {
    this.logger.debug(
      `Execute: get post by id: ${postId}`,
      this.getPostById.name,
    );

    const post: PostWithLikeInfoModel =
      await this.txHost.tx.userPost.findUnique({
        where: {
          id: postId,
          User: {
            userBanInfo: {
              is: null,
            },
          },
        },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          description: true,
          userId: true,
          User: {
            select: {
              username: true,
            },
          },
          LikesPost: {
            where: {
              status: LikeStatusEnum.like,
              User: {
                userBanInfo: {
                  is: null,
                },
              },
            },
            select: {
              userId: true,
            },
            orderBy: {
              updatedAt: 'desc',
            },
            take: 3,
          },
          _count: {
            select: {
              LikesPost: {
                where: {
                  status: LikeStatusEnum.like,
                  User: {
                    userBanInfo: {
                      is: null,
                    },
                  },
                },
              },
            },
          },
        },
      });

    let myStatusLike: LikeStatusEnum = LikeStatusEnum.none;
    if (userId) {
      const myLike = await this.txHost.tx.likesPost.findFirst({
        where: {
          postId,
          userId,
          User: {
            userBanInfo: {
              is: null,
            },
          },
        },
      });
      myStatusLike = (myLike?.status as LikeStatusEnum) || LikeStatusEnum.none;
    }

    post ? (post.myStatus = myStatusLike) : null;
    return post;
  }

  public async getPostsByUser(
    userId: string,
    queryString?: SearchQueryParametersType,
    endCursorPostId?: string,
  ): Promise<{ posts: PostWithLikeInfoRawModel[]; count: number }> {
    this.logger.debug(
      `Execute: get posts by user id: ${userId}`,
      this.getPostsByUser.name,
    );

    const sanitizationQuery = getSanitizationQuery(queryString);

    let endCursorCreatedAt: Date | undefined = undefined;
    let endCursorUpdatedAt: Date | undefined = undefined;

    if (endCursorPostId) {
      const endCursorPost = await this.txHost.tx.userPost.findUnique({
        where: {
          id: endCursorPostId,
          User: {
            userBanInfo: {
              is: null,
            },
          },
        },
        select: {
          createdAt: true,
          updatedAt: true,
        },
      });

      if (endCursorPost) {
        endCursorCreatedAt = endCursorPost.createdAt;
        endCursorUpdatedAt = endCursorPost.updatedAt;
      }
    }

    const where: any = {
      userId,
      User: {
        userBanInfo: {
          is: null,
        },
      },
    };
    let whereClause = Prisma.sql`p."userId" = ${userId} and ubi."userId" IS NULL`;
    if (sanitizationQuery.sortBy === 'createdAt' && endCursorCreatedAt) {
      where.createdAt = {
        [sanitizationQuery.sortDirection === 'asc' ? 'gt' : 'lt']:
          endCursorCreatedAt,
      };
      const operator = sanitizationQuery.sortDirection === 'asc' ? '>' : '<';
      whereClause = Prisma.sql`${whereClause} and p."createdAt" ${Prisma.raw(operator)} ${Prisma.raw(`'${endCursorCreatedAt.toISOString()}'`)}`;
    } else if (sanitizationQuery.sortBy === 'updatedAt' && endCursorUpdatedAt) {
      where.updatedAt = {
        [sanitizationQuery.sortDirection === 'asc' ? 'gt' : 'lt']:
          endCursorUpdatedAt,
      };
      const operator = sanitizationQuery.sortDirection === 'asc' ? '>' : '<';
      whereClause = Prisma.sql`${whereClause} and p."updatedAt" ${Prisma.raw(operator)} ${Prisma.raw(`'${endCursorCreatedAt.toISOString()}'`)}`;
    }

    const sql = Prisma.sql`
       select 
           p.id, 
           p."userId", 
           p."createdAt", 
           p."updatedAt", 
           p."description", 
           u.username,
           coalesce(lp.status, ${LikeStatusEnum.none}) AS "myStatus",
           cast(coalesce(like_count, 0) as integer) as likes,
           ARRAY(
            SELECT lp2."userId"
            FROM "LikesPost" lp2
            LEFT JOIN "UserBanInfo" ubi2 ON lp2."userId" = ubi2."userId"
            WHERE lp2."postId" = p.id AND lp2.status = ${LikeStatusEnum.like} AND ubi2."userId" IS NULL
            ORDER BY lp2."updatedAt" DESC
            LIMIT 3
          ) as "lastLikedUserIds"
       from "UserPost" as p
       left join (
           select "postId", count(*) as like_count 
           from "LikesPost" lp
           left join "UserBanInfo" ubi on lp."userId" = ubi."userId"
           where lp.status = ${LikeStatusEnum.like} and ubi."userId" is null           
           group by "postId"
       ) as likes on likes."postId" = p.id
       left join "LikesPost" as lp on lp."userId" = ${userId} and lp."postId" = p.id
       left join "User" as u on u.id = p."userId"
       left join "UserBanInfo" as ubi on ubi."userId" = u.id
       where ${whereClause}
       group by p.id, u.username, lp.status, like_count
       
       order by "${Prisma.raw(sanitizationQuery.sortBy)}" ${Prisma.raw(sanitizationQuery.sortDirection)}
       limit ${sanitizationQuery.pageSize}               
    `;

    const [posts, count] = await Promise.all([
      this.txHost.tx.$queryRaw(sql),
      this.txHost.tx.userPost.count({
        where,
      }),
    ]);

    return {
      posts: posts as PostWithLikeInfoRawModel[],
      count,
    };
  }

  public async getAllPosts(
    userId: string | null,
    queryString?: SearchQueryParametersType,
    endCursorPostId?: string,
  ): Promise<{ posts: PostWithLikeInfoRawModel[]; count: number }> {
    this.logger.debug(`Execute: get all posts`, this.getAllPosts.name);
    const sanitizationQuery = getSanitizationQuery(queryString);

    let endCursorCreatedAt: Date | undefined = undefined;
    let endCursorUpdatedAt: Date | undefined = undefined;

    if (endCursorPostId) {
      const endCursorPost = await this.txHost.tx.userPost.findUnique({
        where: {
          id: endCursorPostId,
          User: {
            userBanInfo: {
              is: null,
            },
          },
        },
        select: {
          createdAt: true,
          updatedAt: true,
        },
      });

      if (endCursorPost) {
        endCursorCreatedAt = endCursorPost.createdAt;
        endCursorUpdatedAt = endCursorPost.updatedAt;
      }
    }

    const where: any = {
      User: {
        userBanInfo: {
          is: null,
        },
      },
    };
    let whereClause = Prisma.sql`ubi."userId" IS NULL`;
    if (sanitizationQuery.sortBy === 'createdAt' && endCursorCreatedAt) {
      where.createdAt = {
        [sanitizationQuery.sortDirection === 'asc' ? 'gt' : 'lt']:
          endCursorCreatedAt,
      };
      const operator = sanitizationQuery.sortDirection === 'asc' ? '>' : '<';
      whereClause = Prisma.sql`${whereClause} and p."createdAt" ${Prisma.raw(operator)} ${Prisma.raw(`'${endCursorCreatedAt.toISOString()}'`)}`;
    } else if (sanitizationQuery.sortBy === 'updatedAt' && endCursorUpdatedAt) {
      where.updatedAt = {
        [sanitizationQuery.sortDirection === 'asc' ? 'gt' : 'lt']:
          endCursorUpdatedAt,
      };
      const operator = sanitizationQuery.sortDirection === 'asc' ? '>' : '<';
      whereClause = Prisma.sql`${whereClause} and p."updatedAt" ${Prisma.raw(operator)} ${Prisma.raw(`'${endCursorCreatedAt.toISOString()}'`)}`;
    }

    const sql = Prisma.sql`
       select 
           p.id, 
           p."userId", 
           p."createdAt", 
           p."updatedAt", 
           p."description", 
           u.username,
           coalesce(lp.status, ${LikeStatusEnum.none}) AS "myStatus",
           cast(coalesce(like_count, 0) as integer) as likes,
           array(
              select lp2."userId"
              from "LikesPost" lp2
              left join "UserBanInfo" ubi2 on lp2."userId" = ubi2."userId"
              where lp2."postId" = p.id and lp2.status = ${LikeStatusEnum.like} and ubi2."userId" is null
              order by lp2."updatedAt" desc
              limit 3
           ) as "lastLikedUserIds"
       from "UserPost" as p
       left join (
           select "postId", count(*) as like_count 
           from "LikesPost" lp
           left join "UserBanInfo" ubi on lp."userId" = ubi."userId"
           where lp.status = ${LikeStatusEnum.like} and ubi."userId" is null           
           group by "postId"
       ) as likes on likes."postId" = p.id
       left join "LikesPost" as lp on lp."userId" = ${userId} and lp."postId" = p.id
       left join "User" as u on u.id = p."userId"
       left join "UserBanInfo" as ubi on ubi."userId" = u.id
        
       where 
            ${whereClause}
       group by p.id, u.username, lp.status, like_count
       
       order by p."${Prisma.raw(sanitizationQuery.sortBy)}" ${Prisma.raw(sanitizationQuery.sortDirection)}
       limit ${sanitizationQuery.pageSize}               
    `;

    const [posts, count] = await Promise.all([
      this.txHost.tx.$queryRaw(sql),
      this.txHost.tx.userPost.count({
        where,
      }),
    ]);

    return {
      posts: posts as PostWithLikeInfoRawModel[],
      count,
    };
  }

  public async getPostsByUserIds(
    userIds: string[],
    queryString?: SearchQueryParameters,
    endCursorPostId?: string,
  ): Promise<{ posts: PostEntity[]; count: number }> {
    this.logger.debug(
      'Execute: get posts by userIds:',
      this.getPostsByUserIds.name,
    );

    const sanitizationQuery = getSanitizationQuery(queryString);

    let cursorCondition = {};
    if (endCursorPostId) {
      const endCursorPost = await this.txHost.tx.userPost.findUnique({
        where: { id: endCursorPostId },
        select: { createdAt: true, updatedAt: true },
      });

      if (endCursorPost) {
        const cursorField =
          sanitizationQuery.sortBy === 'createdAt' ? 'createdAt' : 'updatedAt';

        cursorCondition = {
          [cursorField]: {
            [sanitizationQuery.sortDirection === 'asc' ? 'gt' : 'lt']:
              endCursorPost[cursorField],
          },
        };
      }
    }

    const where = {
      userId: { in: userIds },
      ...cursorCondition,
    };

    const [posts, count] = await Promise.all([
      this.txHost.tx.userPost.findMany({
        where,
        orderBy: {
          [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection,
        },
        take: sanitizationQuery.pageSize,
        ...(endCursorPostId && { skip: 1 }),
      }),
      this.txHost.tx.userPost.count({ where }),
    ]);

    return {
      posts: posts as PostEntity[],
      count,
    };
  }
}
