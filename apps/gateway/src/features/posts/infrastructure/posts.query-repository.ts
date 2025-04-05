import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { PrismaClient as GatewayPrismaClient } from '@prisma/gateway';
import { SearchQueryParametersType } from '../../../common/domain/query.types';
import { getSanitizationQuery } from '../../../common/utils/query-params.sanitizator';
import { PostEntity } from '../domain/post.entity';
import { LoggerService } from '@app/logger';
import { LikeStatusEnum, PostWithLikeInfoModel } from '../domain/types';

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
  ): Promise<{ posts: PostEntity[]; count: number }> {
    this.logger.debug(
      `Execute: get posts by user id: ${userId}`,
      this.getPostsByUser.name,
    );

    const sanitizationQuery = getSanitizationQuery(queryString);

    let endCursorCreatedAt: Date | undefined = undefined;
    let endCursorUpdatedAt: Date | undefined = undefined;

    if (endCursorPostId) {
      const endCursorPost = await this.txHost.tx.userPost.findUnique({
        where: { id: endCursorPostId },
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

    const where = {
      userId,
      ...(sanitizationQuery.sortBy === 'createdAt' && endCursorCreatedAt
        ? {
            createdAt: {
              [sanitizationQuery.sortDirection === 'asc' ? 'gt' : 'lt']:
                endCursorCreatedAt,
            },
          }
        : {}),
      ...(sanitizationQuery.sortBy === 'updatedAt' && endCursorUpdatedAt
        ? {
            updatedAt: {
              [sanitizationQuery.sortDirection === 'asc' ? 'gt' : 'lt']:
                endCursorUpdatedAt,
            },
          }
        : {}),
    };
    const posts = (await this.txHost.tx.userPost.findMany({
      where,
      orderBy: { [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection },
      take: sanitizationQuery.pageSize,
    })) as PostEntity[];

    const count = await this.txHost.tx.userPost.count({
      where,
    });

    return {
      posts,
      count,
    };
  }

  public async getAllPosts(
    queryString?: SearchQueryParametersType,
    endCursorPostId?: string,
  ): Promise<{ posts: PostEntity[]; count: number }> {
    this.logger.debug(`Execute: get all posts`, this.getAllPosts.name);
    const sanitizationQuery = getSanitizationQuery(queryString);

    let endCursorCreatedAt: Date | undefined = undefined;
    let endCursorUpdatedAt: Date | undefined = undefined;

    if (endCursorPostId) {
      const endCursorPost = await this.txHost.tx.userPost.findUnique({
        where: { id: endCursorPostId },
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

    const where = {
      ...(sanitizationQuery.sortBy === 'createdAt' && endCursorCreatedAt
        ? {
            createdAt: {
              [sanitizationQuery.sortDirection === 'asc' ? 'gt' : 'lt']:
                endCursorCreatedAt,
            },
          }
        : {}),
      ...(sanitizationQuery.sortBy === 'updatedAt' && endCursorUpdatedAt
        ? {
            updatedAt: {
              [sanitizationQuery.sortDirection === 'asc' ? 'gt' : 'lt']:
                endCursorUpdatedAt,
            },
          }
        : {}),
    };

    const posts = (await this.txHost.tx.userPost.findMany({
      orderBy: { [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection },
      where,
      take: sanitizationQuery.pageSize,
    })) as PostEntity[];

    const count = await this.txHost.tx.userPost.count({
      where,
    });

    return {
      posts,
      count,
    };
  }
}
